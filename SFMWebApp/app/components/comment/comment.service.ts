import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IComment } from './comment';
import { HttpClient } from '../../common/httpClient';
import { Logging, LogSeverity } from '../../common/logging';

@Injectable()
export class CommentService {
    private _commentUrl = 'http://ralsfmteam/asa/api/episode/';
    private _commentShowAllSource: BehaviorSubject<IComment[]> = new BehaviorSubject(<IComment[]>{});
    
    commentShowAll$ = this._commentShowAllSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _http: HttpClient) { }

    getAllComments(episodeUID: number) {
        return this._http.get(this._commentUrl + episodeUID + '/comment')
            .map(this.mapComments)
            .do(data => this.logHelper.logMessage("CommentService", "getAllComments", "Get all comments complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._commentShowAllSource.next(data)
            , error => this.logHelper.logMessage("CommentService", "getAllComments", "Error in comments service", LogSeverity.Error)
            );      
    }

    private mapComments(res: Response) {
        let commentsArray = res.json();

        return <IComment[]>commentsArray;
    }

    private handleError(error: Response) {
        this.logHelper.logMessage("CommentService", "handleError", error.toString(), LogSeverity.Error);
        return Observable.throw(error.json().error || 'Server error');
    }
}