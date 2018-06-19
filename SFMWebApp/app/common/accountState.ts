import { AccountDetailPanel } from '../enum/accountDetailPanel';

export interface IAccountState {
    episodeIDArray: number[];
    activeEpisodeID: number;
    activeAccountDetail: AccountDetailPanel;
}