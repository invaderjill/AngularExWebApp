import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { ITransaction } from './transaction';
import * as CommonConstants from '../../common/constants/common.constants';
import { AccountViewService } from '../accountView/accountView.service'
import { EpisodeSummaryService } from '../episodeSummary/episodeSummary.service';
import { TransactionService } from './transaction.service';

import { Logging, LogSeverity } from '../../common/logging';
import { AccountStateStore } from '../../common/accountStateStore';

@Component
    ({
        selector: 'sfm-transactions',
        templateUrl: 'app/components/transaction/transaction.component.html'
    })
export class TransactionComponent implements OnDestroy {
    newEpisodesubscription: Subscription;
    episodeSummarySubscription: Subscription;
    transactionSubscription: Subscription;
    busy: Subscription;

    transactions: ITransaction[];
    showingAll: boolean = false;
    canShowLess: boolean = false;
    numberOfColumns: number;
    public transactionsData: any[];
    public transactionsFilterQuery = "";
    public transactionsSortBy = "postedOn";
    public transactionsSortOrder = "desc";

    logHelper: Logging = new Logging();

    constructor(private _accountViewService: AccountViewService, private _episodeSummaryService: EpisodeSummaryService, private _transactionService: TransactionService, private _accountStore: AccountStateStore) {
        this.newEpisodesubscription = this._accountViewService.accountView$.subscribe(data => this.loadTransactions((data && data.transactions) || null)
            , error => this.logHelper.logMessage("TransactionComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.episodeSummarySubscription = this._episodeSummaryService.episodeSummary$.subscribe(data => this.loadTransactions((data && data.transactions) || null)
            , error => this.logHelper.logMessage("TransactionComponent", "constructor", `Error subscribing to episodeSummary.service: ${error}`, LogSeverity.Error));

        this.transactionSubscription = this._transactionService.transactionShowAll$.subscribe(data => this.loadTransactions(data)
            , error => this.logHelper.logMessage("TransactionComponent", "constructor", `Error subscribing to transaction.service: ${error}`, LogSeverity.Error));
    }

    private loadTransactions(transactions: ITransaction[]): void {
        if (!this.isDataAvailable(transactions)) {
            return;
        }
        this.transactions = transactions;
        this.transactionsData = this.transactions;
        this.numberOfColumns = _.size(this.transactions[0]);

        if (this.transactions.length < CommonConstants.ROWS_ON_PAGE) {
            this.showingAll = true;
            this.canShowLess = false;
        }
    }

    private isDataAvailable(transactions: ITransaction[]): boolean {
        if (transactions == null || transactions == undefined
            || transactions.length == null || transactions.length == undefined || transactions.length < 1) {
            this.logHelper.logMessage("TransactionComponent", "isDataAvailable", "transactions not available", LogSeverity.Info);
            return false;
        }
        return true;
    }

    ngOnDestroy(): void {
        this.newEpisodesubscription.unsubscribe();
        this.episodeSummarySubscription.unsubscribe();
        this.transactionSubscription.unsubscribe();
        this.busy.unsubscribe();
    }

    public toInt(num: string) {
        return +num;
    }

    public showAll(): void {
        this.showingAll = true;
        this.canShowLess = true;

        let accountState = this._accountStore.accountState[this._accountStore.activePatientID];

        this.busy = this._transactionService.getAllTransactions(accountState.activeEpisodeID);
    }

    public showLess(event): void {
        this.canShowLess = false;
        this.showingAll = false;

        this.transactions.splice(CommonConstants.ROWS_ON_PAGE);
    }

    //public sortByWordLength = (a: any) => {
    //    return a.description.length;
    //}

    public more(item) {
        let index = this.transactionsData.indexOf(item);
        //if (index > -1) {
        //    this.transactionsData.splice(index, 1);
        //}
    }
}