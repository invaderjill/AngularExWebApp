export interface IEpisodeItem {
    episodeID: number;
    episodeReceivableAssetUID: number;
    isActive: boolean;
    principalVisitID: number;
    principalVisitIDCode: number;
    principalVisitAdmitDate: Date;
    principalVisitDischargeDate: Date;
    principalVisitType: string;
    principalVisitFacility: string;
    principalVisitLocation: string;
    relatedVisits: {
        visitID: number;
        visitIDCode: number;
        visitAdmitDate: Date;
        visitDischargeDate: Date;
        visitType: string;
        visitFacility: string;
        visitLocation: string;
    }[];
}