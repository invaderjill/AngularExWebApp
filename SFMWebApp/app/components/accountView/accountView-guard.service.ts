import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthorizationStore } from '../../common/authorizationStore';
import { Logging, LogSeverity } from '../../common/logging';

@Injectable()
export class AccountViewGuard implements CanActivate {
    logHelper: Logging = new Logging();

    constructor(private _router:Router, private _authStore: AuthorizationStore) {

    }

    canActivate(): boolean {
        if (this._authStore.authToken == null || this._authStore.authToken == undefined) {
            this.logHelper.logMessage("AccountViewGuard", "canActivate", "No Auth Token found", LogSeverity.Info);
            this._router.navigate(['/login']);
            return false;
        }

        if (this._authStore.authRights == null || this._authStore.authRights == undefined
            || this._authStore.authRights.length == null || this._authStore.authRights.length == undefined || this._authStore.authRights.length < 1) {
            this.logHelper.logMessage("AccountViewGuard", "canActivate", "No Auth Rights found", LogSeverity.Info);
            this._router.navigate(['/login']);
            return false;
        }

        return true;
    }
}