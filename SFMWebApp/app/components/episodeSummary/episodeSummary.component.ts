import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccordionPanelComponent } from '../../common/accordion/accordion-group.component';
import { IVisit } from '../visit/visit';
import { IEpisode } from '../episode/episode';
import { IPatient } from '../patient/patient';
import { IEpisodeSummary } from './episodeSummary';

import { AccountViewService } from '../accountView/accountView.service';
import { PatientService } from '../patient/patient.service';
import { EpisodeService } from '../episode/episode.service';
import { EpisodeSummaryService } from './episodeSummary.service';
import { UnbilledService } from '../unbilled/unbilled.service';
import { AccountStateStore } from '../../common/accountStateStore';

import { Logging, LogSeverity } from '../../common/logging';
import { AccountDetailPanel } from '../../enum/accountDetailPanel';

interface Window {
    external: External;
}
interface External {
    OpenEpisodeSupplemental: Function;
}
declare var window: Window;

@Component({
    selector: 'sfm-episodeSummary',
    templateUrl: 'app/components/episodeSummary/episodeSummary.component.html'
})
export class EpisodeSummaryComponent implements OnDestroy {
    newEpisodeSubscription: Subscription;
    patientChangedSubscription: Subscription;
    episodeChangesSubscription: Subscription;
    episodeSummarySubscription: Subscription;

    episodeSummary: IEpisodeSummary;
    currentBalance: number;
    insurancePlanNames: string[]
    logHelper: Logging = new Logging();
    public headingClass: string = 'clearfix';
    public isFirstOpen: boolean = true;
    isUnbilledOpen: boolean = false;

    constructor(private _accountViewService: AccountViewService
        , private _patientService: PatientService
        , private _episodeService: EpisodeService
        , private _episodeSummaryService: EpisodeSummaryService
        , private _unbilledService: UnbilledService
        , private _accountStateStore: AccountStateStore) {

        this.newEpisodeSubscription = this._accountViewService.accountView$.subscribe(data => this.newEpisodeEntered(
            (data && data.episode) || null
            , (data && data.patient) || null
            , (data && data.visits) || null)
            , error => this.logHelper.logMessage("EpisodeSummaryComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.patientChangedSubscription = this._patientService.patientAccountDetails$.subscribe(data => this.loadPanelIfActive()
            , error => this.logHelper.logMessage("EpisodeSummaryComponent", "constructor", `Error subscribing to patient.service: ${error}`, LogSeverity.Error));

        this.episodeChangesSubscription = this._episodeService.episode$.subscribe(data => this.loadPanelIfActive()
            , error => this.logHelper.logMessage("EpisodeSummaryComponent", "constructor", `Error subscribing to episode.service: ${error}`, LogSeverity.Error));

        this.episodeSummarySubscription = this._episodeSummaryService.episodeSummary$.subscribe(data => this.loadEpisodeSummary(data)
            , error => this.logHelper.logMessage("EpisodeSummaryComponent", "constructor", `Error subscribing to episodeSummary.service: ${error}`, LogSeverity.Error));
    }

    private newEpisodeEntered(episode: IEpisode, patient: IPatient, visits: IVisit[]): void {
        if (!this.isDataAvailable(episode, patient, visits)) {
            return;
        }
        this.episodeSummary = {
            episodeUID: episode.episodeUID,
            receivableAssetUID: episode.receivableAssetUID,
            episodeYear: episode.episodeYear,
            insurancePlanNames: visits[0].insurancePlanNames,
            visitAttendProvider: visits[0].visitAttendProvider,
            visitAdmitProvider: visits[0].visitAdmitProvider,
            visitReferProvider: visits[0].visitReferProvider,
            totalCharges: episode.totalCharges,
            totalPayment: episode.totalPayment,
            totalAdjustment: episode.totalAdjustment,
            unbilled: episode.unbilled,
            unAllocated: episode.unAllocated,
            claims: episode.claims,
            selfP: episode.selfP,
        }
        this.calculateCurrentBalance();
        this.logHelper.logMessage("EpisodeSummaryComponent", "newEpisodeEntered", "newEpisodeEntered completed successfully", LogSeverity.Info);
    }

    private loadPanelIfActive() {
        if (this._accountStateStore == null || this._accountStateStore == undefined || this._accountStateStore.activePatientID == null || this._accountStateStore.activePatientID == undefined) {
            this.logHelper.logMessage("EpisodeSummaryComponent", "patientChanged", "active patient id not available", LogSeverity.Info);
            return;
        }

        let accountState = this._accountStateStore.accountState[this._accountStateStore.activePatientID];

        if (accountState.activeAccountDetail == AccountDetailPanel.EpisodeSummary) {
            this._episodeSummaryService.getEpisodeSummary(accountState.activeEpisodeID);
        }
    }

    private loadEpisodeSummary(episodeSummary: IEpisodeSummary) {
        if (episodeSummary == null || episodeSummary == undefined) {
            this.logHelper.logMessage("EpisodeSummaryComponent", "loadEpisodeSummary", "episode summary not available", LogSeverity.Info);
            return;
        }

        this.episodeSummary = episodeSummary;
        this.calculateCurrentBalance();
    }

    private calculateCurrentBalance(): void {
        this.currentBalance = this.episodeSummary.totalCharges - (this.episodeSummary.totalPayment + this.episodeSummary.totalAdjustment);
    }

    private isDataAvailable(episode: IEpisode, patient: IPatient, visits: IVisit[]): boolean {
        if (!episode || episode == undefined) {
            this.logHelper.logMessage("EpisodeSummaryComponent", "isDataAvailable", "episode not available", LogSeverity.Info);
            return false;
        }
        if (!visits || visits == undefined
            || visits.length == null || visits.length == undefined || visits.length < 1) {
            this.logHelper.logMessage("EpisodeSummaryComponent", "isDataAvailable", "visits not available", LogSeverity.Info);
            return false;
        }
        if (!patient || patient == undefined) {
            this.logHelper.logMessage("EpisodeSummaryComponent", "isDataAvailable", "visits not available", LogSeverity.Info);
            return false;
        }
        return true;
    }

    LoadUnbilledDetails() {
        this.isUnbilledOpen = !this.isUnbilledOpen;

        if (this.isUnbilledOpen) {
            let accountState = this._accountStateStore.accountState[this._accountStateStore.activePatientID];
            this._unbilledService.getInitialUnbilledTxn(accountState.activeEpisodeID);
        }
    }

    EpisodeSupplementalClick() {
        try {
            window.external.OpenEpisodeSupplemental(this.episodeSummary.episodeUID, this.episodeSummary.episodeYear, this.episodeSummary.receivableAssetUID);
        }
        catch (error){
            alert("Functionality available only through gateway");
        }
    }

    ngOnDestroy(): void {
        this.newEpisodeSubscription.unsubscribe();
        this.patientChangedSubscription.unsubscribe();
        this.episodeChangesSubscription.unsubscribe();
        this.episodeSummarySubscription.unsubscribe();
    }
}
