import { IVisit } from '../visit/visit';

export interface IEpisode {
    episodeUID: number;
    principalVisitID: number;
    principalVisitIDCode: number;
    fromDate: Date;
    toDate: Date;
    receivableAssetUID: number;
    episodeYear: number;
    episodeStatus: string;
    episodeFinancialClass: string;
    balance: number;
    totalCharges: number;
    totalPayment: number;
    totalAdjustment: number;
    totalBadDebt: number;
    unbilled: number;
    lateCharge: number;
    unAllocated: number;
    exempt: number;
    claims: number;
    ubSelfP: number;
    selfP: number;
}