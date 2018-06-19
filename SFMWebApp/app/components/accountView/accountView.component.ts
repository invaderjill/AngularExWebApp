import { Component, OnInit, OnDestroy, ElementRef, Renderer, ViewChild } from '@angular/core';
import { Routes, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { BusyDirective } from 'angular2-busy';

import { IAccountView } from './accountView';
import { IEpisode } from '../episode/episode';
import { IVisit } from '../visit/visit';
import { IPatient } from '../patient/patient';
import { IComment } from '../comment/comment';
import { ITransaction } from '../transaction/transaction';

import { AccountViewService } from './accountView.service';

import { Logging, LogSeverity } from '../../common/logging';

interface Window {
    external: External;
    innerHeight: number;
    onresize: Function;
}
interface External {
    searchGUID: string;
}
declare var window: Window;

@Component({
    templateUrl: 'app/components/accountView/accountView.component.html'
})
export class AccountViewComponent implements OnInit {
    accountView: IAccountView;
    errorMessage: string;
    txtValueEpisodeUID: string;
    episodeUID: number;
    logHelper: Logging = new Logging();
    private _el: ElementRef;
    private _renderer: Renderer;
    @ViewChild('col100Height') col100Height: ElementRef;
    loading: boolean = false;
    busy: Subscription;

    constructor(private _accountViewService: AccountViewService,
        private _router: Router, _el: ElementRef, _renderer: Renderer) {
        this._el = _el;
        this._renderer = _renderer;
    }

    ngOnInit(): void {
        this.loading = false;
        window.onresize = this.sizeOnLoad;
        this.sizeOnLoad(this.col100Height);
        this.initializeContract();
    }

    searchClick(episodeUID: string): void {
        this.loading = true;
        try {
            if (window.external.searchGUID != null && window.external.searchGUID != undefined) {
                episodeUID = window.external.searchGUID;
            }

            if (episodeUID == null || episodeUID == undefined) {
                this.logHelper.logMessage("AccountViewComponent", "searchClick", "No id available for search", LogSeverity.Info);
                return;
            }
            
            if (episodeUID.startsWith("P")) {
                this.getEpisodeAndNavigate(episodeUID.substr(1), "patient");
            }
            else if (episodeUID.startsWith("V")) {
                this.getEpisodeAndNavigate(episodeUID.substr(1), "visit");
            }
            else {
                this.getEpisodeAndNavigate(episodeUID, "episode");
            }

            if (window.external.searchGUID != null || window.external.searchGUID != undefined) {
                window.external.searchGUID = null;
            }
        }
        catch (error) {
            this.logHelper.logMessage("AccountViewComponent", "searchClick", `${episodeUID}: ${error}`, LogSeverity.Error);
        }
    }

    private getEpisodeAndNavigate(episodeUID: string, searchBy: string): void {
        if (episodeUID) {
            this.episodeUID = parseInt(episodeUID);

            this.busy = this._accountViewService.getEpisodeInfo(this.episodeUID, searchBy);
            this._router.navigate(['/accountView', this.episodeUID]);
            this.loading = false;
        }
        else {
            this.logHelper.logMessage("AccountViewComponent", "getEpisodeAndNavigate", `episodeUID is: ${this.episodeUID} = not valid.`, LogSeverity.Info);
        }
    }

    sizeOnLoad(element) {
        this._renderer.setElementStyle(this.col100Height.nativeElement, 'height', window.innerHeight + 'px');
    }

    onResize(event) {
        this._renderer.setElementStyle(this.col100Height.nativeElement, 'height', event.target.innerHeight + 'px');
    }

    private initializeContract(): void {
        this.accountView = <IAccountView>{};
        this.accountView.episode = <IEpisode>{};
        this.accountView.visits = <IVisit[]>{};
        this.accountView.patient = <IPatient>{};
        this.accountView.comments = <IComment[]>{};
        this.accountView.transactions = <ITransaction[]>{};
    }
}
