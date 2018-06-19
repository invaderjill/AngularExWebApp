import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { BusyModule } from 'angular2-busy';
import { CollapseModule } from '../../common/collapse/collapse.module';
import { AccordionModule } from '../../common/accordion/accordion.module';
import { TabsModule } from '../../common/tabs/tabs.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { ModalModule } from '../../common/modal/modal.module';
import { LoadingModule } from '../../common/loading/loading.module';
import * as CommonConstants from '../../common/constants/common.constants';

import { AgGridModule } from 'ag-grid-angular/main';
import { CurrencyComponent } from '../../common/agGrid/currency.component';
import { DateComponent } from '../../common/agGrid/date.component';
import { EllipsisComponent } from '../../common/agGrid/ellipsis.component';

import { LoginComponent } from '../login/login.component';
import { AccountViewComponent } from './accountView.component';
import { AccountDetailsComponent } from '../accountDetails/accountDetails.component';
import { EpisodeSummaryComponent } from '../episodeSummary/episodeSummary.component';
import { PatientComponent } from '../patient/patient.component';
import { EpisodeBannerComponent } from '../episodeBanner/episodeBanner.component';
import { EpisodeComponent } from '../episode/episode.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { CommentComponent } from '../comment/comment.component';
import { EpisodeFSComponent } from '../episodeFinancialSummary/episodeFS.component';
import { DataFilterPipe } from '../shared/pipes/data-filter.pipe';
import { AccountViewGuard } from './accountView-guard.service';
import { DataGridComponent } from '../../common/datagrid/datagrid.component';
import { TransactionComponentV2 } from '../transactionV2/transactionV2.component';

import { AuthenticationService } from '../authentication/authentication.service';
import { AccountViewService } from './accountView.service';
import { PatientService } from '../patient/patient.service';
import { EpisodeService } from '../episode/episode.service';
import { EpisodeBannerService } from '../episodeBanner/episodeBanner.service';
import { EpisodeSummaryService } from '../episodeSummary/episodeSummary.service';
import { CommentService } from '../comment/comment.service';
import { TransactionService } from '../transaction/transaction.service';
import { UnbilledService } from '../unbilled/unbilled.service';

import { AccountStateStore } from '../../common/accountStateStore';
import { HttpClient } from '../../common/httpClient';
import { AuthorizationStore } from '../../common/authorizationStore';

@NgModule({
    declarations: [
        LoginComponent,
        AccountViewComponent,
        PatientComponent,
        EpisodeBannerComponent,
        EpisodeComponent,
        AccountDetailsComponent,
        EpisodeSummaryComponent,
        TransactionComponent,
        CommentComponent,
        EpisodeFSComponent,
        DataFilterPipe,
        DataGridComponent,
        TransactionComponentV2,
        CurrencyComponent,
        DateComponent,
        EllipsisComponent
    ],
    imports: [
        RouterModule.forChild([
            {
                path: 'accountView',
                component: AccountViewComponent,
                canActivate: [AccountViewGuard],
                children: [
                    { path: ':episodeUID', component: AccountDetailsComponent }
                ]
            },
            {
                path: 'login',
                component: LoginComponent
            }
        ]),
        CommonModule,
        FormsModule,
        DataTableModule,
        BusyModule,
        CollapseModule.forRoot(),
        AccordionModule.forRoot(),
        TabsModule.forRoot(),
        AgGridModule.withComponents([CurrencyComponent, DateComponent, EllipsisComponent]),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        LoadingModule.forRoot()
    ],
    exports: [DataTableModule, CollapseModule, AccordionModule, TabsModule, TooltipModule, ModalModule, LoadingModule, DataFilterPipe],
    providers: [
        AuthenticationService,
        AccountViewService,
        AccountViewGuard,
        PatientService,
        EpisodeService,
        EpisodeBannerService,
        EpisodeSummaryService,
        AccountStateStore,
        HttpClient,
        AuthorizationStore,
        CommentService,
        TransactionService,
        UnbilledService
    ]
})
export class AccountViewModule { }

