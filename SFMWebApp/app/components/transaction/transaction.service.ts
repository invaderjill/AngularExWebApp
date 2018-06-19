import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ITransaction } from './transaction';
import { HttpClient } from '../../common/httpClient';
import { Logging, LogSeverity } from '../../common/logging';

@Injectable()
export class TransactionService {
    private _transactionUrl = 'http://ralsfmteam/asa/api/episode/';
    private _transactionShowAllSource: BehaviorSubject<ITransaction[]> = new BehaviorSubject(<ITransaction[]>{});

    transactionShowAll$ = this._transactionShowAllSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getAllTransactions(episodeUID: number) {
        return this._http.get(this._transactionUrl + episodeUID + '/transaction')
            .map(this.mapTransactions)
            .do(data => this.logHelper.logMessage("TransactionService", "getAllTransactions", "Get all comments complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._transactionShowAllSource.next(data)
            , error => this.logHelper.logMessage("TransactionService", "getAllTransactions", "Error in comments service", LogSeverity.Error)
            );
    }

    private mapTransactions(res: Response) {
        let transactionsArray = res.json();

        return <ITransaction[]>transactionsArray;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("CommentService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}