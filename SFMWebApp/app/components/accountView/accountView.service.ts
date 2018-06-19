import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IAccountView } from './accountView';
import { IVisit } from '../visit/visit';
import { IComment } from '../comment/comment';
import { ITransaction } from '../transaction/transaction';
import { IAccountState } from '../../common/accountState';
import { AccountDetailPanel } from '../../enum/accountDetailPanel';
import { Logging, LogSeverity } from '../../common/logging';

import { AccountStateStore } from '../../common/accountStateStore';
import { HttpClient } from '../../common/httpClient';
import { ProviderHelper } from '../../common/helper/providerHelper';

@Injectable()
export class AccountViewService {
    private _episodeAccountUrl = 'http://ralsfmteam/asa/api/episode/';
    private _patientAccountURL = 'http://ralsfmteam/asa/api/patient/';
    private _visitAccountURL = 'http://ralsfmteam/asa/api/visit/';
    private _accountViewSource: BehaviorSubject<IAccountView> = new BehaviorSubject(<IAccountView>{});

    accountView$ = this._accountViewSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient, private _accountStateStore: AccountStateStore) { }

    getEpisodeInfo(searchUID: number, searchBy: string) {
        let apiURL: string;

        if (searchBy == null || searchBy == undefined) {
            this.logHelper.logMessage("AccountViewService", "getEpisodeInfo", "search by not specified", LogSeverity.Info);
            return;
        }

        if (searchBy == "patient") {
            apiURL = this._patientAccountURL + searchUID + "/episode";
        }
        else if (searchBy == "visit") {
            apiURL = this._visitAccountURL + searchUID + "/episode";
        }
        else if (searchBy == "episode") {
            apiURL = this._episodeAccountUrl + searchUID;
        }

        return this._http.get(apiURL)
            .map(this.mapAccountView)
            .do(data => this.saveToAccountStore(data))
            .catch(this.handleError)
            .subscribe(
            data => this._accountViewSource.next(data)
            , error => this.logHelper.logMessage("AccountViewService", "getEpisodeInfo", "Error in shared service", LogSeverity.Error)
            );
    }

    private mapAccountView(res: Response) {
        let visitArray: IVisit[] = [];

        let providerHelper = new ProviderHelper(null);

        for (var v = 0; v < res.json().visits.length; v++) {
            providerHelper = new ProviderHelper(res.json().visits[v].providers);
            let providers = providerHelper.getProviders();

            visitArray.push({
                visitID: res.json().visits[v].visitLiteID
                , visitIDCode: res.json().visits[v].visitLiteIDCode
                , visitType: res.json().visits[v].typeCode
                , isPrincipleVisit: (v == 0) ? true : false
                , admitDate: res.json().visits[v].admitDtm
                , dischargeDate: res.json().visits[v].dischargeDtm
                , visitFacility: res.json().visits[v].visitFacility
                , visitLocation: res.json().visits[v].visitLocation
                , insurancePlanNames: res.json().visits[v].insurancePlanNames
                , visitReferProvider: providers.referringProvider
                , visitAdmitProvider: providers.admittingProvider
                , visitAttendProvider: providers.attendingProvider
            })
        }

        let accountView = {
            episode: {
                episodeUID: res.json().episodeID
                , principalVisitID: res.json().principalVisitID
                , principalVisitIDCode: res.json().principalVisitIDCode
                , fromDate: res.json().fromDate
                , toDate: res.json().throughDate
                , receivableAssetUID: res.json().receivableAssetUID
                , episodeYear: res.json().episodeYear
                , episodeStatus: res.json().episodeStatus
                , episodeFinancialClass: res.json().episodeFinancialClass
                , balance: res.json().balance
                , totalCharges: res.json().totalCharges
                , totalPayment: res.json().totalPayments
                , totalAdjustment: res.json().totalAdjustments
                , totalBadDebt: res.json().totalBadDebt
                , unbilled: res.json().unbilled
                , lateCharge: res.json().lateCharge
                , unAllocated: res.json().unAllocated
                , exempt: res.json().exempt
                , claims: res.json().claims
                , ubSelfP: res.json().ubSelfP
                , selfP: res.json().selfP
            },
            visits: visitArray,
            patient: {
                patientID: res.json().patient.patientLiteID
                , patientLastName: res.json().patient.firstName
                , patientFirstName: res.json().patient.lastName
                , patientMiddleName: res.json().patient.MiddleName
                , patientTitle: res.json().patient.Title
                , patientGender: res.json().patient.genderCode
                , patientDOB: res.json().patient.patientDOB
                , patientAge: res.json().patient.patientAge
            },
            comments: res.json().comments,
            transactions: res.json().transactions
        };

        return <IAccountView>accountView;
    }

    private saveToAccountStore(account: IAccountView) {
        // check if patient exists
        // if not then add it to the store and default active episode to episode entered and active detail to episode summary
        if (!this._accountStateStore.accountState[account.patient.patientID]) {
            this._accountStateStore.accountState[account.patient.patientID] = <IAccountState>{
                episodeIDArray: [account.episode.episodeUID]
                , activeEpisodeID: account.episode.episodeUID
                , activeAccountDetail: AccountDetailPanel.EpisodeSummary
            };

            this.logHelper.logMessage("AccountViewService", "saveToAccountStore", "new patient added to store", LogSeverity.Info);
        }
        // if patient exists check if episode exists
        // if not then add it to the episode list of the patient and set to active episode with active detail defaulted to episode summary
        else if (!this._accountStateStore.accountState[account.patient.patientID].episodeIDArray.some(e => e == account.episode.episodeUID)) {
            this._accountStateStore.accountState[account.patient.patientID].episodeIDArray.push(account.episode.episodeUID);
            this._accountStateStore.accountState[account.patient.patientID].activeEpisodeID = account.episode.episodeUID;
            this._accountStateStore.accountState[account.patient.patientID].activeAccountDetail = AccountDetailPanel.EpisodeSummary;

            this.logHelper.logMessage("AccountViewService", "saveToAccountStore", `new episode added to store for patient id: ${account.patient.patientID}`, LogSeverity.Info);
        }

        this._accountStateStore.activePatientID = account.patient.patientID;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("AccountViewService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}