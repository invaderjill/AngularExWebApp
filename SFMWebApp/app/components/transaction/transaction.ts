export interface ITransaction {
    transactionID: number;
    transactionYear: number;
    postedOn: Date;
    servicedOn: Date;
    amount: number;
    revenueCode: string;
    cptHcpcs: string;
    transactionCode: string;
    transactionCodeDescription: string;
}