import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ITransaction } from '../transaction/transaction';

import { Logging, LogSeverity } from '../../common/logging';
import { HttpClient } from '../../common/httpClient';

@Injectable()
export class UnbilledService {
    private _unbilledTxnUrl = 'http://ralsfmteam/asa/api/episode/';
    private _unbilledTxnSource: BehaviorSubject<ITransaction[]> = new BehaviorSubject(<ITransaction[]>{});

    unbilledTxn$ = this._unbilledTxnSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getInitialUnbilledTxn(episodeUID: number) {
        return this._http.get(this._unbilledTxnUrl + episodeUID + "/transaction/1")
            .map(this.mapTop5UnbilledTxn)
            .do(data => this.logHelper.logMessage("UnbilledComponent", "getInitialUnbilledTxn", "Get initial unbilled transaction complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._unbilledTxnSource.next(data)
            , error => this.logHelper.logMessage("UnbilledComponent", "getInitialUnbilledTxn", "Error in unbilled transaction service", LogSeverity.Error)
            );
    }

    getAllUnbilledTxn(episodeUID: number) {
        return this._http.get(this._unbilledTxnUrl + episodeUID + "/transaction/1")
            .map(this.mapUnbilledTxn)
            .do(data => this.logHelper.logMessage("UnbilledComponent", "getAllUnbilledTxn", "Get all unbilled transaction complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._unbilledTxnSource.next(data)
            , error => this.logHelper.logMessage("UnbilledComponent", "getAllUnbilledTxn", "Error in unbilled transaction service", LogSeverity.Error)
            );
    }

    private mapTop5UnbilledTxn(res: Response) {
        if (res == null || res == undefined || res.json() == null || res.json() == undefined) {
            return null;
        }

        if (res.json().length <= 5) {
            return <ITransaction[]>res.json();
        }

        return <ITransaction[]>res.json().slice(0, 5);
    }

    private mapUnbilledTxn(res: Response) {
        return <ITransaction[]>res.json();
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("PatientService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}