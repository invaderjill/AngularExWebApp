export interface IVisit {
    visitID: number;
    visitIDCode: number;
    visitType: string;
    isPrincipleVisit: boolean;
    admitDate: Date;
    dischargeDate: Date;
    visitFacility: string;
    visitLocation: string;
    insurancePlanNames: string[];
    visitReferProvider: string;
    visitAdmitProvider: string;
    visitAttendProvider: string;
}