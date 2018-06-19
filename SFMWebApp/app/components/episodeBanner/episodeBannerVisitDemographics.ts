export interface IEpisodeBannerVisitDemographics {
    AdmitOn: Date;
    AdmitType: string;
    AdmitSource: string;
    Complaint: string;
    AccidentalRelated: boolean;
    ReferringProvider: string;
    ReferredFrom: string;
    CareLevel: string;
    Service: string;
    LOS: string;
    ChartGroup: string;
    OnsetIllnessOn: Date;
    OnsetIllnessTreatedOn: Date;
    AdmittingProvider: string;
    ModeOfArrival: string;
    VisitPrivacyStatus: string;
    Confidential: boolean;
    AttendingProvider: string;
    SourceOfId: string;
}