import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IPatientAccountDetail } from '../accountView/patientAccountDetail';
import { IEpisodeItem } from '../episode/episodeItem';

import { Logging, LogSeverity } from '../../common/logging';
import { HttpClient } from '../../common/httpClient';

@Injectable()
export class PatientService {
    private _accountUrl = 'http://ralsfmteam/asa/api/episode/';
    private _patientAccountDetailsSource: BehaviorSubject<IPatientAccountDetail> = new BehaviorSubject(<IPatientAccountDetail>{});

    patientAccountDetails$ = this._patientAccountDetailsSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getPatientAccountDetails(episodeIDArray: number[], activeEpisodeID: number) {
        let queryString = new URLSearchParams();
        queryString.set("episodeIDs", episodeIDArray.toString());
        queryString.set("activeEpisodeID", activeEpisodeID.toString());

        return this._http.get(this._accountUrl, queryString)
            .map(this.mapPatientAccountDetail)
            .do(data => this.logHelper.logMessage("PatientService", "getPatientAccountDetails", "Get patient accounts complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._patientAccountDetailsSource.next(data)
            , error => this.logHelper.logMessage("PatientService", "getPatientAccountDetails", "Error in shared service", LogSeverity.Error)
            );
    }

    private mapPatientAccountDetail(res: Response) {
        let episodeItems: IEpisodeItem[] = [];
        for (var e = 0; e < res.json().episodePanelList.length; e++) {
            episodeItems.push({
                episodeID: res.json().episodePanelList[e].episodeID
                , episodeReceivableAssetUID: res.json().episodePanelList[e].receivableAssetUID
                , isActive: false
                , principalVisitID: res.json().episodePanelList[e].principalVisitID
                , principalVisitIDCode: res.json().episodePanelList[e].principalVisitIDCode
                , principalVisitAdmitDate: res.json().episodePanelList[e].admitDate
                , principalVisitDischargeDate: res.json().episodePanelList[e].dischargeDate
                , principalVisitType: res.json().episodePanelList[e].visitType
                , principalVisitFacility: res.json().episodePanelList[e].visitFacility
                , principalVisitLocation: res.json().episodePanelList[e].visitLocation
                , relatedVisits: []
            });
        }

        let insurancePlanNames = res.json().episodeBanner.insurancePlanNames.toString();
        let patientAccountDetail = {
            episodeItemArray: episodeItems
            , episodeBanner: {
                episodeID: res.json().episodeBanner.episodeID
                , episodeReceivableAssetUID: res.json().episodeBanner.episodeReceivableAssetID
                , principalVisitID: res.json().episodeBanner.principalVisitID
                , principalVisitIDCode: res.json().episodeBanner.principalVisitIDCode
                , patientID: res.json().episodeBanner.patientIDCode
                , patientLastName: res.json().episodeBanner.patientLastName
                , patientMiddleName: res.json().episodeBanner.patientMiddleName
                , patientFirstName: res.json().episodeBanner.patientFirstName
                , patientTitle: res.json().episodeBanner.patientTitle
                , patientGender: res.json().episodeBanner.patientGender
                , patientDOB: res.json().episodeBanner.patientDOB
                , patientAge: res.json().episodeBanner.patientAge
                , insurancePlanNames: insurancePlanNames
                , episodeFinancialClass: res.json().episodeBanner.episodeFinancialCode
                , episodeBalance: res.json().episodeBanner.episodeBalance
                , episodeStatus: res.json().episodeBanner.episodeStatus
            }
        }

        return <IPatientAccountDetail>patientAccountDetail;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("PatientService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}