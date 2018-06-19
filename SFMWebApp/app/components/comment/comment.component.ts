import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IComment } from './comment';
import * as CommonConstants from '../../common/constants/common.constants';
import { AccountViewService } from '../accountView/accountView.service';
import { EpisodeSummaryService } from '../episodeSummary/episodeSummary.service';
import { CommentService } from './comment.service';

import { Logging, LogSeverity } from '../../common/logging';
import { AccountStateStore } from '../../common/accountStateStore';

@Component
    ({
        selector: 'sfm-comments',
        templateUrl: 'app/components/comment/comment.component.html'
    })

export class CommentComponent implements OnDestroy {
    newEpisodeSubscription: Subscription;
    loadEpisodeSummarySubscription: Subscription;
    loadCommentsSubscription: Subscription;
    busy: Subscription;

    comments: IComment[];
    showingAll: boolean = false;
    canShowLess: boolean = false;
    numberOfColumns: number = 7;
    public commentsData: any[];
    public commentsFilterQuery = "";
    public commentsSortBy = "createdOn";
    public commentsSortOrder = "desc";

    logHelper: Logging = new Logging();

    constructor(private _accountViewService: AccountViewService, private _episodeSummaryService: EpisodeSummaryService, private _commentService: CommentService, private _accountStore: AccountStateStore) {
        this.newEpisodeSubscription = this._accountViewService.accountView$.subscribe(data => this.loadComments((data && data.comments) || null)
            , error => this.logHelper.logMessage("CommentComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.loadEpisodeSummarySubscription = this._episodeSummaryService.episodeSummary$.subscribe(data => this.loadComments((data && data.comments) || null)
            , error => this.logHelper.logMessage("CommentComponent", "constructor", `Error subscribing to episodeSummary.service: ${error}`, LogSeverity.Error));

        this.loadCommentsSubscription = this._commentService.commentShowAll$.subscribe(data => this.loadComments(data)
            , error => this.logHelper.logMessage("CommentComponent", "constructor", `Error subscribing to comment.service: ${error}`, LogSeverity.Error));
    }

    private loadComments(comments: IComment[]): void {
        if (!this.isDataAvailable(comments)) {
            return;
        }
        this.comments = comments;
        this.commentsData = this.comments;

        if (this.comments.length < CommonConstants.ROWS_ON_PAGE) {
            this.showingAll = true;
            this.canShowLess = false;
        }
    }

    private isDataAvailable(comments: IComment[]): boolean {
        if (comments == null || comments == undefined
            || comments.length == null || comments.length == undefined || comments.length < 1) {
            this.logHelper.logMessage("CommentComponent", "isDataAvailable", "Comments are not available", LogSeverity.Info);
            return false;
        }
        return true;
    }

    ngOnDestroy(): void {
        this.newEpisodeSubscription.unsubscribe();
        this.loadEpisodeSummarySubscription.unsubscribe();
        this.loadCommentsSubscription.unsubscribe();
    }

    public toInt(num: string) {
        return +num;
    }

    public showAll(): void {
        this.showingAll = true;
        this.canShowLess = true;

        let accountState = this._accountStore.accountState[this._accountStore.activePatientID];

        this.busy = this._commentService.getAllComments(accountState.activeEpisodeID);
    }

    public showLess(): void {
        this.canShowLess = false;
        this.showingAll = false;

        this.comments.splice(CommonConstants.ROWS_ON_PAGE);
    }

    //public sortByWordLength = (a: any) => {
    //    return a.description.length;
    //}

    public more(item) {
        let index = this.commentsData.indexOf(item);
        //if (index > -1) {
        //    this.transactionsData.splice(index, 1);
        //}
    }
}