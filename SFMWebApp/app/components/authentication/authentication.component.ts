import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from './authentication.service';

import { Logging, LogSeverity } from '../../common/logging';
import { AuthorizationStore } from '../../common/authorizationStore';

interface Window {
    external: External;
}
interface External {
    UserToken: string;
}
declare var window: Window;

@Component({
    templateUrl: 'app/components/authentication/authentication.component.html'
})
export class AuthenticationComponent implements OnInit, OnDestroy {
    authsubscription: Subscription;
    logHelper: Logging = new Logging();

    constructor(private _router: Router, private _authenticationService: AuthenticationService, private _authStore: AuthorizationStore) {
        this.authsubscription = this._authenticationService.authUsingToken$.subscribe(data => this.authUsingTokenComplete((data) || null)
            , error => this.logHelper.logMessage("AuthenticationComponent", "constructor", `Error subscribing to login.service: ${error}`, LogSeverity.Error));
    }

    private authUsingTokenComplete(authRights: string[]) {
        if (authRights == null || authRights == undefined
            || authRights.length == null || authRights.length == undefined || authRights.length < 1) {
            this.logHelper.logMessage("AuthenticationComponent", "authUsingTokenComplete", "initial subscription, do nothing", LogSeverity.Info);
            return;
        }

        this.logHelper.logMessage("AuthenticationComponent", "authUsingTokenComplete", "token authenticated and rights available, redirect to account view", LogSeverity.Info);
        this._authStore.authRights = authRights;

        this._router.navigate(['/accountView']);
    }

    ngOnInit(): void {
        let sfmUserToken = window.external.UserToken;
        
        // if there is user token then the user needs to login via a userName and password
        if (sfmUserToken != null && sfmUserToken != undefined) {
            this._authStore.authToken = sfmUserToken;
            this._authenticationService.authenticateUsingToken();
        }
        else {
            this.logHelper.logMessage("AuthenticationComponent", "ngOnInit", "token not available, redirect to login", LogSeverity.Info);
            this._router.navigate(['/login']);
        }
    }

    ngOnDestroy(): void {
        this.authsubscription.unsubscribe();
    }
}