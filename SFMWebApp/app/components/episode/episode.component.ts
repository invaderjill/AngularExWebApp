import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IEpisode } from './episode';
import { IEpisodeItem } from './episodeItem';
import { IVisit } from '../visit/visit';
import { IPatient } from '../patient/patient';

import { AccordionPanelComponent } from '../../common/accordion/accordion-group.component';
import { AccountViewService } from '../accountView/accountView.service';
import { PatientService } from '../patient/patient.service';
import { EpisodeService } from '../episode/episode.service';
import { AccountStateStore } from '../../common/accountStateStore';

import { Logging, LogSeverity } from '../../common/logging';

interface Window {
    external: External;
}
interface External {
    PublishContext: Function;
}
declare var window: Window;

@Component({
    selector: 'sfm-episodes',
    templateUrl: 'app/components/episode/episode.component.html'
})
export class EpisodeComponent implements OnDestroy {
    newEpisodeSubscription: Subscription;
    patientChangedSubscription: Subscription;

    episodeItemArray: IEpisodeItem[] = [];
    openPatients: {
        patientID: number
        , lastName: string
        , middleName: string
        , firstName: string
    }[] = [];
    selectedEpisode: number;
    logHelper: Logging = new Logging();
    headingClass: string;
    public isActive: boolean = true;

    private _episodeItem: IEpisodeItem;

    constructor(private _accountViewService: AccountViewService, private _patientService: PatientService, private _episodeService: EpisodeService, private _accountStateStore: AccountStateStore) {
        this.newEpisodeSubscription = this._accountViewService.accountView$.subscribe(data => this.newEpisodeEntered(
            (data && data.episode) || null
            , (data && data.patient) || null
            , (data && data.visits) || null)
            , error => this.logHelper.logMessage("EpisodeComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));

        this.patientChangedSubscription = this._patientService.patientAccountDetails$.subscribe(data => this.patientChanged((data && data.episodeItemArray) || null)
            , error => this.logHelper.logMessage("EpisodeComponent", "constructor", `Error subscribing to patient.service: ${error}`, LogSeverity.Error));

        this.headingClass = 'clearfix';
    }

    private newEpisodeEntered(episode: IEpisode, patient: IPatient, visits: IVisit[]): void {
        this._episodeItem = <IEpisodeItem>{};

        if (!this.isDataAvailable(episode, patient, visits)) {
            return;
        }

        // if patient id already exists
        // add to the episode list if does not exists
        if (this.openPatients.some(p => p.patientID == patient.patientID)) {
            if (this.episodeItemArray.some(e => e.episodeID == episode.episodeUID)) {
                this.logHelper.logMessage("EpisodeComponent", "newEpisodeEntered", `episodeUID: ${episode.episodeUID} already exists`, LogSeverity.Info);
                return;
            }
            this.setEpisodeItemArray(episode, visits, false);
        }
        // else if patient does not exist create a new episode array
        else {
            this.openPatients.push({
                patientID: patient.patientID
                , lastName: patient.patientLastName
                , middleName: patient.patientMiddleName
                , firstName: patient.patientFirstName
            });
            this.setEpisodeItemArray(episode, visits, true);
        }

        this.publishContext(episode.principalVisitID, episode.principalVisitIDCode, patient.patientLastName, patient.patientMiddleName, patient.patientFirstName);
    }

    private patientChanged(episodeItemArray: IEpisodeItem[]): void {
        if (episodeItemArray == null || episodeItemArray == undefined
            || episodeItemArray.length == null || episodeItemArray.length == undefined || episodeItemArray.length < 1) {
            this.logHelper.logMessage("EpisodeComponent", "patientChanged", "episode items are not available", LogSeverity.Info);
            return;
        }
        this.episodeItemArray = episodeItemArray;

        this.setAllEpisodesToInactive();
        let activeEpisodeIndex = this.episodeItemArray.findIndex(e => e.episodeID == this._accountStateStore.accountState[this._accountStateStore.activePatientID].activeEpisodeID);
        this.episodeItemArray[activeEpisodeIndex].isActive = true;

        let activePatient = this.openPatients.find(p => p.patientID == this._accountStateStore.activePatientID);
        this.publishContext(this.episodeItemArray[activeEpisodeIndex].principalVisitID, this.episodeItemArray[activeEpisodeIndex].principalVisitIDCode, activePatient.lastName, activePatient.middleName, activePatient.firstName);
    }

    episodeChanged(activeEpisodeIndex: number) {
        this.setAllEpisodesToInactive();

        this.episodeItemArray[activeEpisodeIndex].isActive = true;
        this._accountStateStore.accountState[this._accountStateStore.activePatientID].activeEpisodeID = this.episodeItemArray[activeEpisodeIndex].episodeID;

        this._episodeService.episodeChanged(this.episodeItemArray[activeEpisodeIndex].episodeID);

        let activePatient = this.openPatients.find(p => p.patientID == this._accountStateStore.activePatientID);
        this.publishContext(this.episodeItemArray[activeEpisodeIndex].principalVisitID, this.episodeItemArray[activeEpisodeIndex].principalVisitIDCode, activePatient.lastName, activePatient.middleName, activePatient.firstName);
    }

    ngOnDestroy(): void {
        this.newEpisodeSubscription.unsubscribe();
        this.patientChangedSubscription.unsubscribe();
    }

    private isDataAvailable(episode: IEpisode, patient: IPatient, visits: IVisit[]): boolean {
        if (episode == null || episode == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "isDataAvailable", "episode data not available", LogSeverity.Info);
            return false;
        }

        if (episode.episodeUID == null || episode.episodeUID == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "isDataAvailable", "episodeUID not available", LogSeverity.Info);
            return false;
        }

        if (patient == null || patient == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "isDataAvailable", "patient not available", LogSeverity.Info);
            return false;
        }

        if (patient.patientID == null || patient.patientID == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "isDataAvailable", "patientID not available", LogSeverity.Info);
            return false;
        }

        if (!this.isVisitDataAvailable(visits)) {
            this.logHelper.logMessage("EpisodeComponent", "isDataAvailable", "visit data not available", LogSeverity.Info);
            return false;
        }

        return true;
    }

    private setEpisodeItemArray(episode: IEpisode, visits: IVisit[], isNewPatient: boolean) {
        this.setAllEpisodesToInactive();
        this._episodeItem.episodeID = episode.episodeUID;
        this._episodeItem.episodeReceivableAssetUID = episode.receivableAssetUID;
        this._episodeItem.isActive = true;

        this.setEpisodeItemVisits(episode.principalVisitID, visits);

        if (isNewPatient) {
            this.episodeItemArray = [this._episodeItem];
            return;
        }

        this.episodeItemArray.push(this._episodeItem);
    }

    private setEpisodeItemVisits(principalVisitID: number, visits: IVisit[]): void {
        if (principalVisitID == null || principalVisitID == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "setPrincipalVisit", "principalVisitsID is not available", LogSeverity.Info);
            return;
        }

        if (!this.isVisitDataAvailable(visits)) {
            this.logHelper.logMessage("EpisodeComponent", "setPrincipalVisit", "visit data not available", LogSeverity.Info);
            return;
        }

        let principalVisit = visits.find(v => v.visitID == principalVisitID);

        if (principalVisit == null || principalVisit == undefined) {
            this.logHelper.logMessage("EpisodeComponent", "setPrincipalVisit", `principal visit not found in visit list. principal visit id: ${principalVisitID}`, LogSeverity.Info);
            return;
        }

        this._episodeItem.principalVisitID = principalVisit.visitID;
        this._episodeItem.principalVisitIDCode = principalVisit.visitIDCode;
        this._episodeItem.principalVisitAdmitDate = principalVisit.admitDate;
        this._episodeItem.principalVisitDischargeDate = principalVisit.dischargeDate;
        this._episodeItem.principalVisitType = principalVisit.visitType;
        this._episodeItem.principalVisitFacility = principalVisit.visitFacility;
        this._episodeItem.principalVisitLocation = principalVisit.visitLocation;

        let index = visits.indexOf(principalVisit);
        if (index > -1) {
            visits.forEach((v, i) => {
                if (i != index) {
                    this._episodeItem.relatedVisits.push({
                        visitID: v.visitID
                        , visitIDCode: v.visitIDCode
                        , visitAdmitDate: v.admitDate
                        , visitDischargeDate: v.dischargeDate
                        , visitType: v.visitType
                        , visitFacility: v.visitFacility
                        , visitLocation: v.visitLocation
                    });
                }
            });
        }
    }

    private isVisitDataAvailable(visits: IVisit[]): boolean {
        if (visits == null || visits == undefined
            || visits.length == null || visits.length == undefined || visits.length < 1) {
            this.logHelper.logMessage("EpisodeComponent", "isVisitDataAvailable", "visit data not available", LogSeverity.Info);
            return false;
        }

        return true;
    }

    private setAllEpisodesToInactive() {
        if (this.episodeItemArray != null && this.episodeItemArray != undefined
            && this.episodeItemArray.length != null && this.episodeItemArray.length != undefined && this.episodeItemArray.length > 0) {
            this.episodeItemArray.forEach(e => e.isActive = false);
        }
    }

    private publishContext(visitGUID: number, visitIDCode: number, patientLastName: string, patientMiddleName: string, patientFirstName: string) {
        let patientVisitContext = {
            Patient:
            {
                ClientGUID: this._accountStateStore.activePatientID
                , FirstName: patientFirstName
                , MiddleName: patientMiddleName
                , LastName: patientLastName
                , DateOfBirthDay: ""
                , DateOfBirthMonth: ""
                , DateOfBirthYear: ""
                , Gender: ""
                , DeceasedDtm: ""
                , PrivacyStatus: ""
                , EnterpriseNumber: ""
                , IDs: {}
                , DisplayName: ""
                , ContextType: 1
            }
            , VisitGUID: visitGUID
            , VisitNumber: visitIDCode
            , VisitType: ""
            , MRN: ""
            , AssignedLocation: ""
            , VisitStatusCode: ""
            , AdmitDtm: ""
            , IDs: {}
            , DisplayName: ""
            , ContextType: 3
        }

        let json = JSON.stringify(patientVisitContext);
        try {
            window.external.PublishContext(json, 3);
        }
        catch (error) {
        }
    }
}
