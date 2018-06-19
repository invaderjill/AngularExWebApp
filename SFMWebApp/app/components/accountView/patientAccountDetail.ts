import { IEpisodeItem } from '../episode/episodeItem';
import { IEpisodeBanner } from '../episodeBanner/episodeBanner';

export interface IPatientAccountDetail {
    episodeItemArray: IEpisodeItem[]
    , episodeBanner: IEpisodeBanner
}