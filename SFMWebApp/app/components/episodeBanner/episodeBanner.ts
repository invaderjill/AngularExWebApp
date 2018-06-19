export interface IEpisodeBanner {
    episodeID: number;
    episodeReceivableAssetUID: number;
    principalVisitID: number;
    principalVisitIDCode: number;
    patientID: number;
    patientLastName: string;
    patientMiddleName: string;
    patientFirstName: string;
    patientTitle: string;
    patientGender: string;
    patientDOB: Date;
    patientAge: number;
    insurancePlanNames: string;
    episodeFinancialClass: string;
    episodeBalance: number;
    episodeStatus: string;   
}