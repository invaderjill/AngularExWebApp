import { Component, OnDestroy, OnInit, animate, transition, style, state, trigger } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IEpisodeBanner } from '../episodeBanner/episodeBanner';
import { IEpisode } from '../episode/episode';
import { IVisit } from '../visit/visit';
import { IPatient } from '../patient/patient'
import { IEpisodeBannerVisitDemographics } from '../episodeBanner/episodeBannerVisitDemographics';

import { AccountViewService } from '../accountView/accountView.service';
import { PatientService } from '../patient/patient.service';
import { EpisodeService } from '../episode/episode.service';
import { EpisodeBannerService } from '../episodeBanner/episodeBanner.service';

import { Logging, LogSeverity } from '../../common/logging';
import { AuthorizationStore } from '../../common/authorizationStore';

@Component({
    selector: 'sfm-episodeBanner',
    templateUrl: 'app/components/episodeBanner/episodeBanner.component.html',
    animations: [
        trigger('expandedState', [
            state('collapsed', style({ height: 0 })),
            state('expanded', style({ height: '*' })),
            transition('collapsed => expanded', animate('300ms ease-in', style({ height: '*' }))),
            transition('expanded => collapsed', animate('300ms ease-out', style({ height: 0 })))
        ])
    ]
})

export class EpisodeBannerComponent implements OnDestroy {
    newEpisodeSubscription: Subscription;
    patientChangedSubscription: Subscription;
    episodeChangedSubscription: Subscription;
    episodeBannerSubscription: Subscription;
    busy: Subscription;

    episodeBanner: IEpisodeBanner;
    episodeBannerVisitDemographics: IEpisodeBannerVisitDemographics
    patientIDMasked: string;
    logHelper: Logging = new Logging();
    expanded: boolean = false;
    expandedState: string = 'collapsed';
    public name: string = 'Tabs';
    errorMessage: string;
    canViewVisitDemographics: boolean;

    constructor(private _accountViewService: AccountViewService
        , private _patientService: PatientService
        , private _episodeService: EpisodeService
        , private _episodeBannerService: EpisodeBannerService
        , private _authStore: AuthorizationStore) {
        this.newEpisodeSubscription = this._accountViewService.accountView$.subscribe(data => this.newEpisodeEntered(
            (data && data.episode) || null
            , (data && data.patient) || null
            , (data && data.visits) || null)
            , error => this.logHelper.logMessage("EpisodeBannerComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.patientChangedSubscription = this._patientService.patientAccountDetails$.subscribe(data => this.loadEpisodeBanner(
            (data && data.episodeBanner) || null)
            , error => this.logHelper.logMessage("EpisodeBannerComponent", "constructor", `Error subscribing to patient.service: ${error}`, LogSeverity.Error));

        this.episodeChangedSubscription = this._episodeService.episode$.subscribe(data => this.loadEpisodeBanner(data)
            , error => this.logHelper.logMessage("EpisodeBannerComponent", "constructor", `Error subscribing to episode.service: ${error}`, LogSeverity.Error));

        this.episodeBannerSubscription = this._episodeBannerService.episodeBannerVisitDemographics$.subscribe(data => this.loadVisitDemographics(data)
            , error => this.logHelper.logMessage("EpisodeBannerComponent", "constructor", `Error subscribing to episodeBanner.service: ${error}`, LogSeverity.Error));
    }


    private newEpisodeEntered(episode: IEpisode, patient: IPatient, visits: IVisit[]): void {
        if (!this.isDataAvailable(episode, patient, visits)) {
            return;
        }

        this.episodeBanner = {
            episodeID: episode.episodeUID
            , episodeReceivableAssetUID: episode.receivableAssetUID
            , principalVisitID: episode.principalVisitID
            , principalVisitIDCode: episode.principalVisitIDCode
            , patientID: patient.patientID
            , patientLastName: patient.patientLastName
            , patientMiddleName: patient.patientMiddleName
            , patientFirstName: patient.patientFirstName
            , patientTitle: patient.patientTitle
            , patientGender: patient.patientGender
            , patientDOB: patient.patientDOB
            , patientAge: patient.patientAge
            , insurancePlanNames: visits[0].insurancePlanNames.toString()
            , episodeFinancialClass: episode.episodeFinancialClass
            , episodeBalance: episode.balance
            , episodeStatus: episode.episodeStatus
        };
    }

    private loadEpisodeBanner(episodeBanner: IEpisodeBanner): void {
        if (episodeBanner == null || episodeBanner == undefined) {
            this.logHelper.logMessage("EpisodeBannerComponent", "loadEpisodeBanner", "episode banner are not available", LogSeverity.Info);
            return;
        }
        this.episodeBanner = episodeBanner;
    }

    private loadVisitDemographics(episodeBannerVisitDemographics: IEpisodeBannerVisitDemographics) {
        if (episodeBannerVisitDemographics == null || episodeBannerVisitDemographics == undefined) {
            this.logHelper.logMessage("EpisodeBannerComponent", "loadVisitDemographics", "episode banner visit demographics are not available", LogSeverity.Info);
            return;
        }

        this.episodeBannerVisitDemographics = episodeBannerVisitDemographics;
        let ebvd = episodeBannerVisitDemographics;

        this.episodeBannerVisitDemographics = {
            AdmitOn: ebvd.AdmitOn,
            AdmitType: ebvd.AdmitType != null && ebvd.AdmitType != undefined ? ebvd.AdmitType : '---',
            AdmitSource: ebvd.AdmitSource != null && ebvd.AdmitSource != undefined ? ebvd.AdmitSource : '---',
            Complaint: ebvd.Complaint != null && ebvd.Complaint != undefined ? ebvd.Complaint : '---',
            AccidentalRelated: ebvd.AccidentalRelated,
            ReferringProvider: ebvd.ReferringProvider != null && ebvd.ReferringProvider != undefined ? ebvd.ReferringProvider : '---',
            ReferredFrom: ebvd.ReferredFrom != null && ebvd.ReferredFrom != undefined ? ebvd.ReferredFrom : '---',
            CareLevel: ebvd.CareLevel != null && ebvd.CareLevel != undefined ? ebvd.CareLevel : '---',
            Service: ebvd.Service != null && ebvd.Service != undefined ? ebvd.Service : '---',
            LOS: ebvd.LOS != null && ebvd.LOS != undefined ? ebvd.LOS : '---',
            ChartGroup: ebvd.ChartGroup != null && ebvd.ChartGroup != undefined ? ebvd.ChartGroup : '---',
            OnsetIllnessOn: ebvd.OnsetIllnessOn,
            OnsetIllnessTreatedOn: ebvd.OnsetIllnessTreatedOn,
            AdmittingProvider: ebvd.AdmittingProvider != null && ebvd.AdmittingProvider != undefined ? ebvd.AdmittingProvider : '---',
            ModeOfArrival: ebvd.ModeOfArrival != null && ebvd.ModeOfArrival != undefined ? ebvd.ModeOfArrival : '---',
            VisitPrivacyStatus: ebvd.VisitPrivacyStatus != null && ebvd.VisitPrivacyStatus != undefined ? ebvd.VisitPrivacyStatus : '---',
            Confidential: ebvd.Confidential,
            AttendingProvider: ebvd.AttendingProvider != null && ebvd.AttendingProvider != undefined ? ebvd.AttendingProvider : '---',
            SourceOfId: ebvd.SourceOfId != null && ebvd.SourceOfId != undefined ? ebvd.SourceOfId : '---'
        };
    }

    ngOnInit(): void {
        if (this._authStore.authRights == null || this._authStore.authRights == undefined
            || this._authStore.authRights.length == null || this._authStore.authRights.length == undefined || this._authStore.authRights.length < 1) {
            this.logHelper.logMessage("EpisodeBannerComponent", "ngOnInit", "auth rights not available", LogSeverity.Info);
            this.canViewVisitDemographics = false;
            return;
        }

        if (!this._authStore.authRights.find(a => a != null && a != undefined && a.toLowerCase() == "canviewvisitdemographic")) {
            this.logHelper.logMessage("EpisodeBannerComponent", "ngOnInit", "view visit demographics right not available", LogSeverity.Info);
            this.canViewVisitDemographics = false;
            return;
        }

        this.canViewVisitDemographics = true;
    }

    ngOnDestroy(): void {
        this.newEpisodeSubscription.unsubscribe();
        this.patientChangedSubscription.unsubscribe();
        this.episodeChangedSubscription.unsubscribe();
        this.episodeBannerSubscription.unsubscribe();
    }

    private isDataAvailable(episode: IEpisode, patient: IPatient, visits: IVisit[]): boolean {
        if (episode == null || episode == undefined) {
            this.logHelper.logMessage("EpisodeBannerComponent", "isDataAvailable", "episode null or undefined", LogSeverity.Info);
            return false;
        }
        if (patient == null || patient == undefined) {
            this.logHelper.logMessage("EpisodeBannerComponent", "isDataAvailable", "patient null or undefined", LogSeverity.Info);
            return false;
        }

        if (visits == null || visits == undefined
            || visits.length == null || visits.length == undefined || visits.length < 1) {
            this.logHelper.logMessage("EpisodeBannerComponent", "isDataAvailable", "visits null or undefined", LogSeverity.Info);
            return false;
        }
        return true;
    }

    toggleExpandedState() {
        this.expandedState = this.expanded ? 'collapsed' : 'expanded';
        this.expanded = !this.expanded

        if (this.expanded && this.canViewVisitDemographics) {
            this.busy = this._episodeBannerService.getVisitDemographic(this.episodeBanner.principalVisitID);
        }
    }
}
