import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Logging, LogSeverity } from '../../common/logging';

@Component({
    templateUrl: 'app/components/accountdetails/accountdetails.component.html',
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
    episodeUID: number;
    paramSub: any;
    logHelper: Logging = new Logging();

    constructor(private _route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.logHelper.logMessage("AccountDetailsComponent", "ngOnInit", "initialized", LogSeverity.Info);

        this.paramSub = this._route.params.subscribe(params => this.episodeUID = +params['episodeUID']);
        this.logHelper.logMessage("AccountDetailsComponent", "ngOnInit", `param - ${this.episodeUID}`, LogSeverity.Info);
    }

    ngOnDestroy() {
        this.paramSub.unsubscribe();
    }
}