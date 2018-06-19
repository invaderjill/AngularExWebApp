import { ITransaction } from '../transaction/transaction';
import { IComment } from '../comment/comment';

export interface IEpisodeSummary {
    episodeUID: number;
    receivableAssetUID: number;
    episodeYear: number;
    insurancePlanNames: string[];
    visitAttendProvider: string;
    visitAdmitProvider: string;
    visitReferProvider: string;
    totalCharges: number;
    totalPayment: number;
    totalAdjustment: number;
    totalBadDebt?: number;
    unbilled: number;
    unAllocated: number;
    claims: number;
    selfP: number;
    lateCharge?: number;
    exempt?: number;
    ubSelfP?: number;
    transactions?: ITransaction[];
    comments?: IComment[];
}