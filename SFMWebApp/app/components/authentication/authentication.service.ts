import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IAuthentication } from './authentication';
import { Logging, LogSeverity } from '../../common/logging';

import { HttpClient } from '../../common/httpClient';

@Injectable()
export class AuthenticationService {
    private _authUsingTokenUrl = 'http://ralsfmteam/asa/api/users/AuthToken';
    private _authUsingCredentialUrl = 'http://ralsfmteam/asa/api/users/login';

    private _authUsingTokenSource: BehaviorSubject<string[]> = new BehaviorSubject(<string[]>[]);
    private _authUsingCredentialsSource: BehaviorSubject<IAuthentication> = new BehaviorSubject(<IAuthentication>{});

    authUsingToken$ = this._authUsingTokenSource.asObservable();
    authUsingCredentials$ = this._authUsingCredentialsSource.asObservable();
    logHelper: Logging = new Logging();

    constructor(private _httpClient: HttpClient, private _http: Http) { }

    authenticateUsingToken() {
        return this._httpClient.get(this._authUsingTokenUrl)
            .map(this.mapAuthRights)
            .do(data => this.logHelper.logMessage("AuthenticationService", "authenticateUsingToken", "authentication complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._authUsingTokenSource.next(data)
            , error => this.logHelper.logMessage("AuthenticationService", "authenticateUsingToken", "Error in authentication service", LogSeverity.Error)
            );
    }

    authenticateUsingCredentials(username: string, password: string) {
        if (username == null || username == undefined || password == null || password == undefined) {
            this.logHelper.logMessage("AuthenticationService", "authenticateUsingCredentials", "username or password unavailable", LogSeverity.Info)
            return;
        }

        let headers = new Headers();
        headers.append('UserName', username);
        headers.append('Password', password);

        return this._http.get(this._authUsingCredentialUrl, { headers: headers })
            .map(this.mapAuthTokenAndRights)
            .do(data => this.logHelper.logMessage("AuthenticationService", "authenticateUsingCredentials", "authentication complete", LogSeverity.Info))
            .catch(this.handleError)
            .subscribe(
            data => this._authUsingCredentialsSource.next(data)
            , error => this.logHelper.logMessage("AuthenticationService", "authenticateUsingCredentials", "Error in authentication service", LogSeverity.Error)
            );
    }

    private mapAuthRights(res: Response) {
        let authRights: string[];
        authRights = res.json();
        return <string[]>authRights;
    }

    private mapAuthTokenAndRights(res: Response) {
        let authTokenAndRights = {
            authToken: res.json().token
            , authRights: res.json().permission
        }

        return <IAuthentication>authTokenAndRights;
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}