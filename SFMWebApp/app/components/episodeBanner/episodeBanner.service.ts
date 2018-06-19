import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IEpisodeBannerVisitDemographics } from '../episodeBanner/episodeBannerVisitDemographics';

import { Logging, LogSeverity } from '../../common/logging';
import { HttpClient } from '../../common/httpClient';
import { ProviderHelper } from '../../common/helper/providerHelper';

@Injectable()
export class EpisodeBannerService {
    private _accountUrl = 'http://ralsfmteam/asa/api/visit/';
    private _episodeBannerVisitDemographicSource: BehaviorSubject<IEpisodeBannerVisitDemographics> = new BehaviorSubject(<IEpisodeBannerVisitDemographics>{});

    episodeBannerVisitDemographics$ = this._episodeBannerVisitDemographicSource.asObservable();

    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getVisitDemographic(visitID: number) {
        return this._http.get(this._accountUrl + visitID)
            .map(this.mapVisitDemographics)
            .do(data => this.logHelper.logMessage("EpisodeBannerService", "getVisitDemographic", "Get visit demographic complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._episodeBannerVisitDemographicSource.next(data)
            , error => this.logHelper.logMessage("EpisodeBannerService", "getVisitDemographic", "Error in visit demogrpahic service", LogSeverity.Error)
            );
    }

    private mapVisitDemographics(res: Response) {
        let providerHelper = new ProviderHelper(res.json().providers);
        let providers = providerHelper.getProviders();

        let episodeBannerVisitDemographics = {
            AdmitOn: res.json().admitDtm
            , AdmitType: res.json().admitType
            , AdmitSource: res.json().admitSource
            , Complaint: res.json().complaint
            , AccidentalRelated: res.json().isAccidentRelated
            , ReferringProvider: providers.referringProvider
            , ReferredFrom: res.json().referredFrom
            , CareLevel: res.json().careLevel
            , Service: res.json().service
            , LOS: res.json().expectedLOS
            , ChartGroup: res.json().chartGroup
            , OnsetIllnessOn: res.json().onsetDTM
            , OnsetIllnessTreatedOn: res.json().onsetTreatedDate
            , AdmittingProvider: providers.admittingProvider
            , ModeOfArrival: res.json().modeOfArrival
            , VisitPrivacyStatus: res.json().privacyStatus
            , Confidential: res.json().isConfidential
            , AttendingProvider: providers.attendingProvider
            , SourceOfId: res.json().sourceOfID
        };

        return <IEpisodeBannerVisitDemographics>episodeBannerVisitDemographics;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("EpisodeBannerService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}