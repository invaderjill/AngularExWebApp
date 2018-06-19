import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../authentication/authentication.service';

import { IAuthentication } from '../authentication/authentication';
import { Logging, LogSeverity } from '../../common/logging';
import { AuthorizationStore } from '../../common/authorizationStore';

@Component({
    templateUrl: 'app/components/login/login.component.html'
})
export class LoginComponent implements OnDestroy {
    userName: string;
    password: string;

    authSubscription: Subscription;
    logHelper: Logging = new Logging();

    constructor(private _router: Router, private _authenticationService: AuthenticationService, private _authStore: AuthorizationStore) {
        this.authSubscription = this._authenticationService.authUsingCredentials$.subscribe(data => this.authUsingCredentialsComplete((data) || null)
            , error => this.logHelper.logMessage("LoginComponent", "constructor", `Error subscribing to login.service: ${error}`, LogSeverity.Error));
    }

    private authUsingCredentialsComplete(authentication: IAuthentication) {
        if (this.isDataAvailable(authentication) == false) {
            return;
        }

        this._authStore.authToken = authentication.authToken;
        this._authStore.authRights = authentication.authRights;

        this._router.navigate(['/accountView']);
    }

    loginUsingCredentials() {
        if (this.userName == null || this.userName == undefined || this.password == null || this.password == undefined) {
            this.logHelper.logMessage("LoginComponent", "loginUsingCredentials", "username or password not available", LogSeverity.Info);
            return;
        }

        this._authenticationService.authenticateUsingCredentials(this.userName, this.password);
    }

    private isDataAvailable(authentication: IAuthentication): boolean {
        if (authentication == null || authentication == undefined) {
            this.logHelper.logMessage("LoginComponent", "isDataAvailable", "authentication object not available", LogSeverity.Info);
            return false;
        }

        if (authentication.authToken == null || authentication.authToken == undefined) {
            this.logHelper.logMessage("LoginComponent", "isDataAvailable", "authentication token not available", LogSeverity.Info);
            return false;
        }

        if (authentication.authRights == null || authentication.authRights == undefined
            || authentication.authRights.length == null || authentication.authRights.length == undefined || authentication.authRights.length < 1) {
            this.logHelper.logMessage("LoginComponent", "isDataAvailable", "authorization rights not available", LogSeverity.Info);
            return false;
        }

        return true;
    }

    ngOnDestroy(): void {
        this.authSubscription.unsubscribe();
    }
}