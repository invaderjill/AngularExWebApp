import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BusyModule, BusyConfig } from 'angular2-busy';

import { AccountViewModule } from './components/accountView/accountView.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { PageNotFoundComponent } from './components/pageNotFound.component';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        RouterModule.forRoot(
            [
                { path: 'authentication', component: AuthenticationComponent },
                { path: '', redirectTo: 'authentication', pathMatch: 'full' },
                { path: '**', component: PageNotFoundComponent }
            ]),
        AccountViewModule, 
        BusyModule.forRoot(
            new BusyConfig({
                message: 'Loading...',
                backdrop: false,
                template: `
                    <div class='sfm-loading-div'><i class="fa fa-spinner fa-spin fa-2x"></i><span>{{message}}</span></div>
                `,
                minDuration: 500
            })
        )
    ],
    declarations: [
        AppComponent,
        AuthenticationComponent,
        PageNotFoundComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }