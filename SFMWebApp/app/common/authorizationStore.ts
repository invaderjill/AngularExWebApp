import { Injectable } from '@angular/core';

@Injectable()
export class AuthorizationStore {
    authToken: string;
    authRights: string[];
}