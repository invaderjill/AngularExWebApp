import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';

import { AuthorizationStore } from './authorizationStore';

@Injectable()
export class HttpClient {

    constructor(private http: Http, private _authStore: AuthorizationStore) { }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Authorization', this._authStore.authToken);
    }

    get(url, queryString?: URLSearchParams) {
        let options = new RequestOptions();
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        options.headers = headers;

        if (queryString != null && queryString != undefined) {
            options.search = queryString;
        }

        //return this.http.get(url, { headers: headers });
        return this.http.get(url, options);
    }
}