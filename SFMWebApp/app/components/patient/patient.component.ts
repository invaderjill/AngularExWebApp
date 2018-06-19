import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IPatient } from './patient';
import { IPatientItem } from './patientItem';

import { AccountViewService } from '../accountView/accountView.service';
import { PatientService } from './patient.service';
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
    selector: 'sfm-patients',
    templateUrl: 'app/components/patient/patient.component.html'
})
export class PatientComponent implements OnDestroy {
    subscription: Subscription;
    patientLabel: string;
    patients: IPatientItem[] = [];
    logHelper: Logging = new Logging();

    constructor(private _accountViewService: AccountViewService, private _patientService: PatientService, private _accountStateStore: AccountStateStore) {
        this.subscription = this._accountViewService.accountView$.subscribe(data => this.newEpisodeEntered(data.patient)
            , error => this.logHelper.logMessage("PatientComponent", "constructor", `Error subscribing to accountView.service: ${error}`, LogSeverity.Error));
    }

    private newEpisodeEntered(patient: IPatient): void {
        if (!this.isDataAvailable(patient)) {
            return;
        }

        if (this.patients.some(p => p.patientID == patient.patientID)) {
            this.logHelper.logMessage("PatientComponent", "newEpisodeEntered", `patient id: ${patient.patientID} already exists`, LogSeverity.Info);
            return;
        }
        if (this.patients.some(p => p.isActive)) {
            this.patients.forEach(p => p.isActive = false);
        }
        this.patientLabel = this.generatePatientLabel(
            ((patient.patientLastName == null) ? "" : patient.patientLastName)
            , ((patient.patientFirstName == null) ? "" : patient.patientFirstName)
            , ((patient.patientTitle == null) ? "" : patient.patientTitle));
        let patientItem = {
            patientID: patient.patientID,
            patientFirstName: patient.patientFirstName,
            patientMiddleName: patient.patientMiddleName,
            patientLastName: patient.patientLastName,
            patientGender: patient.patientGender,
            patientLabel: this.patientLabel,
            patientTitle: patient.patientTitle,
            isActive: true
        }
        this.patients.push(patientItem);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    changePatientSelection(selectedIndex: number) {
        let selectedPatientItem = this.patients[selectedIndex];
        this.patients.forEach(p => p.isActive = false);
        selectedPatientItem.isActive = true;
        let accountState = this._accountStateStore.accountState[selectedPatientItem.patientID];
        this._accountStateStore.activePatientID = selectedPatientItem.patientID;

        this._patientService.getPatientAccountDetails(accountState.episodeIDArray, accountState.activeEpisodeID);
    }

    private isDataAvailable(patient: IPatient): boolean {
        if (patient == null || patient == undefined) {
            this.logHelper.logMessage("PatientComponent", "isDataAvailable", "patient is not available", LogSeverity.Info);
            return false;
        }
        if (patient.patientID == null || patient.patientID == undefined) {
            this.logHelper.logMessage("PatientComponent", "isDataAvailable", "patient is not available", LogSeverity.Info);
            return false;
        }
        return true;
    }

    close(closeIndex: number): void {
        let deletedPatient = this.patients[closeIndex];
        this.patients.splice(closeIndex, (closeIndex + 1));
        if (this.patients.length == 0) {
            //this._patientService.resetScreen();
            return;
        }
        else if (deletedPatient && deletedPatient != undefined && deletedPatient.isActive) {
            let firstPatient = this.patients[0];
            firstPatient.isActive = true;
            let accountState = this._accountStateStore.accountState[firstPatient.patientID];
            this._accountStateStore.activePatientID = firstPatient.patientID;
            this._patientService.getPatientAccountDetails(accountState.episodeIDArray, accountState.activeEpisodeID);
        }
    }

    private generatePatientLabel(lastName: string, firstName: string, title: string): string {
        if (!lastName && !firstName && !title) {
            this.logHelper.logMessage("PatientComponent", "generatePatientLabel", "patient name is not available", LogSeverity.Info);
            return;
        }
        let labelName = "";
        if (lastName.length >= 14) {
            labelName = labelName.concat(lastName.substring(0, 14).toUpperCase(), '...');
            return labelName;
        }
        else if (lastName.length >= 8) {
            labelName = labelName.concat(lastName.substring(0, lastName.length).toUpperCase(), ', ', firstName);
            if (title && title.length > 0) {
                labelName = labelName.concat(' (', title, ')');
            }
            if (labelName.length >= 14) {
                labelName = labelName.substring(0, 14).concat('...');
            }
            return labelName;
        }
        else if (!title || title == '') {
            labelName = labelName.concat(lastName.toUpperCase(), ', ', firstName);
        }
        else {
            labelName = labelName.concat(lastName.toUpperCase(), ', ', firstName, ' (', title, ')');
        }
        if (labelName.length > 20) {
            labelName = labelName.substring(0, 20);
            labelName = labelName.concat('...');
        }
        return labelName;
    }
}