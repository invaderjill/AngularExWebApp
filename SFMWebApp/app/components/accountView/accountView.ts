import { IEpisode } from '../episode/episode';
import { IVisit } from '../visit/visit';
import { IPatient } from '../patient/patient';
import { IComment } from '../comment/comment';
import { ITransaction } from '../transaction/transaction';

export interface IAccountView {
    episode: IEpisode;
    visits: IVisit[];
    patient: IPatient;
    comments: IComment[];
    transactions: ITransaction[];
}