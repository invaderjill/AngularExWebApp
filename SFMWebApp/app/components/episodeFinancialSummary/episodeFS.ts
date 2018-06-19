export interface IEpisodeFS {
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