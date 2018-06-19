import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IEpisodeFS } from './EpisodeFS';
import { IEpisode } from '../episode/episode';
import { IEpisodeSummary } from '../episodeSummary/episodeSummary';

import { AccountViewService } from '../accountView/accountView.service';
import { EpisodeSummaryService } from '../episodeSummary/episodeSummary.service';

import { Logging, LogSeverity } from '../../common/logging';

@Component
    ({
        selector: 'sfm-episodeFS',
        templateUrl: 'app/components/episodeFinancialSummary/episodeFS.component.html'
    })
export class EpisodeFSComponent implements OnDestroy {
    newEpisodeSubscription: Subscription;
    episodeSummarySubscription: Subscription;

    episodeFinancialInfo: IEpisodeFS;
    episodeSummary: IEpisodeSummary;
    arBaddebt: number;
    logHelper: Logging = new Logging();

    constructor(private _accountViewService: AccountViewService, private _episodeSummaryService: EpisodeSummaryService) {
        this.newEpisodeSubscription = this._accountViewService.accountView$.subscribe(data => this.newEpisodeEntered((data && data.episode) || null)
            , error => this.logHelper.logMessage("EpisodeFSComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.episodeSummarySubscription = this._episodeSummaryService.episodeSummary$.subscribe(data => this.loadEpisodeSummary(data)
            , error => this.logHelper.logMessage("EpisodeFSComponent", "constructor", `Error subscribing to episodeSummary.service: ${error}`, LogSeverity.Error))
    }

    private newEpisodeEntered(episode: IEpisode): void {
        if (!this.isDataAvailable(episode)) {
            return;
        }
        this.episodeFinancialInfo = {
            totalCharges: episode.totalCharges,
            totalPayment: episode.totalPayment,
            totalAdjustment: episode.totalAdjustment,
            totalBadDebt: episode.totalBadDebt,
            unbilled: episode.unbilled,
            lateCharge: episode.lateCharge,
            unAllocated: episode.unAllocated,
            exempt: episode.exempt,
            claims: episode.claims,
            ubSelfP: episode.ubSelfP,
            selfP: episode.selfP
        }

        this.calculateARBadDebt();
    }

    private loadEpisodeSummary(episodeSummary: IEpisodeSummary) {
        if (episodeSummary == null || episodeSummary == undefined) {
            this.logHelper.logMessage("EpisodeFSComponent", "loadEpisodeSummary", "episode summary not available", LogSeverity.Info);
            return;
        }

        this.episodeFinancialInfo = {
            totalCharges: episodeSummary.totalCharges,
            totalPayment: episodeSummary.totalPayment,
            totalAdjustment: episodeSummary.totalAdjustment,
            totalBadDebt: episodeSummary.totalBadDebt,
            unbilled: episodeSummary.unbilled,
            lateCharge: episodeSummary.lateCharge,
            unAllocated: episodeSummary.unAllocated,
            exempt: episodeSummary.exempt,
            claims: episodeSummary.claims,
            ubSelfP: episodeSummary.ubSelfP,
            selfP: episodeSummary.selfP
        }

        this.calculateARBadDebt();
    }

    private calculateARBadDebt(): void {
        if (this.episodeFinancialInfo.totalBadDebt || this.episodeFinancialInfo.totalBadDebt == undefined || this.episodeFinancialInfo.totalBadDebt == 0) {
            this.logHelper.logMessage("EpisodeFSComponent", "newEpisodeEntered", "episodeFinancialInfo.totalBadDebt is not available", LogSeverity.Info);
            return;
        }

        this.arBaddebt = this.episodeFinancialInfo.totalBadDebt * -1;
    }

    ngOnDestroy(): void {
        this.newEpisodeSubscription.unsubscribe();
        this.episodeSummarySubscription.unsubscribe();
    }

    private isDataAvailable(episode: IEpisode) {
        if (episode == null || episode == undefined) {
            this.logHelper.logMessage("EpisodeFSComponent", "isDataAvailable", "episode not available", LogSeverity.Info);
            return false;
        }

        return true;
    }
}