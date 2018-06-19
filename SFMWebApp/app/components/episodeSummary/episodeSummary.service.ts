import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IEpisodeSummary } from './episodeSummary';
import { IComment } from '../comment/comment';
import { ITransaction } from '../transaction/transaction';

import { Logging, LogSeverity } from '../../common/logging';
import { ProviderHelper } from '../../common/helper/providerHelper';
import { HttpClient } from '../../common/httpClient';

@Injectable()
export class EpisodeSummaryService {
    private _accountUrl = 'http://ralsfmteam/asa/api/episode/';
    private _episodeSummarySource: BehaviorSubject<IEpisodeSummary> = new BehaviorSubject(<IEpisodeSummary>{});

    episodeSummary$ = this._episodeSummarySource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getEpisodeSummary(episodeUID: number) {
        return this._http.get(this._accountUrl + episodeUID + "/episodeSummary")
            .map(this.mapEpisodeSummary)
            .do(data => this.logHelper.logMessage("EpisodeSummaryService", "getEpisodeSummary", "Get episode summary complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._episodeSummarySource.next(data)
            , error => this.logHelper.logMessage("EpisodeSummaryService", "getEpisodeSummary", "Error in episode summary service", LogSeverity.Error)
            );
    }

    private mapEpisodeSummary(res: Response) {
        let providerHelper = new ProviderHelper(res.json().providers);
        let providers = providerHelper.getProviders();

        let episodeSummary = {
            episodeUID: res.json().episodeID
            , receivableAssetUID: res.json().receivableAssetUID
            , episodeYear: res.json().episodeYear
            , insurancePlanNames: res.json().insurancePlanNames
            , visitAttendProvider: providers.attendingProvider
            , visitAdmitProvider: providers.admittingProvider
            , visitReferProvider: providers.referringProvider
            , totalCharges: res.json().episodeFS.totalCharges
            , totalPayment: res.json().episodeFS.totalPayments
            , totalAdjustment: res.json().episodeFS.totalAdjustments
            , totalBadDebt: 0
            , unbilled: res.json().episodeFS.unbilledCharges
            , unAllocated: res.json().episodeFS.unallocated
            , claims: res.json().episodeFS.claims
            , selfP: res.json().episodeFS.selfPay
            , lateCharge: res.json().episodeFS.lateChargesWriteOff
            , exempt: res.json().episodeFS.exemptFromBilling
            , ubSelfP: res.json().episodeFS.unbilledSelfPay
            , transactions: res.json().transactions
            , comments: res.json().comments
        }

        return <IEpisodeSummary>episodeSummary;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("PatientService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}