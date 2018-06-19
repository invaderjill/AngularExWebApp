import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IEpisodeBanner } from '../episodeBanner/episodeBanner';

import { Logging, LogSeverity } from '../../common/logging';
import { HttpClient } from '../../common/httpClient';

@Injectable()
export class EpisodeService {
    private _accountUrl = 'http://ralsfmteam/asa/api/episode/';
    private _episodeSource: BehaviorSubject<IEpisodeBanner> = new BehaviorSubject(<IEpisodeBanner>{});

    episode$ = this._episodeSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    episodeChanged(episodeUID: number) {
        return this._http.get(this._accountUrl + episodeUID + "/banner")
            .map(this.mapEpisodeBanner)
            .do(data => this.logHelper.logMessage("EpisodeService", "episodeChanged", "Get episode summary complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._episodeSource.next(data)
            , error => this.logHelper.logMessage("EpisodeService", "episodeChanged", "Error in episode summary service", LogSeverity.Error)
            );
    }

    private mapEpisodeBanner(res: Response) {
        let insurancePlanNames = res.json().insurancePlanNames.toString();
        let episodeBanner = {
            episodeID: res.json().episodeID
            , episodeReceivableAssetUID: res.json().episodeReceivableAssetID
            , principalVisitID: res.json().principalVisitID
            , principalVisitIDCode: res.json().principalVisitIDCode
            , patientID: res.json().patientIDCode
            , patientLastName: res.json().patientLastName
            , patientMiddleName: res.json().patientMiddleName
            , patientFirstName: res.json().patientFirstName
            , patientTitle: res.json().patientTitle
            , patientGender: res.json().patientGender
            , patientDOB: res.json().patientDOB
            , patientAge: res.json().patientAge
            , insurancePlanNames: insurancePlanNames
            , episodeFinancialClass: res.json().episodeFinancialCode
            , episodeBalance: res.json().episodeBalance
            , episodeStatus: res.json().episodeStatus
        }

        return <IEpisodeBanner>episodeBanner;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("PatientService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}