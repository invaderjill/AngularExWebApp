import { Injectable } from '@angular/core';

import { IAccountState } from '../common/accountState';

@Injectable()
export class AccountStateStore {
    activePatientID: number;
    accountState: { [patientID: number]: IAccountState } = {};
}