import { Logging, LogSeverity } from '../logging';

interface IProvider {
    providerID: number;
    name: string;
    role: string;
}

export class ProviderHelper {
    logHelper: Logging = new Logging();

    constructor(private _providers: IProvider[]) { }

    getProviders(): { admittingProvider: string; attendingProvider: string; referringProvider: string } {
        if (this._providers == null || this._providers == undefined
            || this._providers.length == null || this._providers.length == undefined || this._providers.length < 1) {
            this.logHelper.logMessage("ProviderHelper", "getProviders", "providers not available", LogSeverity.Info);
            return {
                admittingProvider: ""
                , attendingProvider: ""
                , referringProvider: ""
            };
        }

        let admittingProvider: string;
        let attendingProvider: string;
        let referringProvider: string;

        if (this._providers.find(p => p.role.toLowerCase() == "admitting")) {
            admittingProvider = this._providers.find(p => p.role.toLowerCase() == "admitting").name;
        }
        if (this._providers.find(p => p.role.toLowerCase() == "attending")) {
            attendingProvider = this._providers.find(p => p.role.toLowerCase() == "attending").name;
        }
        if (this._providers.find(p => p.role.toLowerCase() == "referring doctor")) {
            referringProvider = this._providers.find(p => p.role.toLowerCase() == "referring doctor").name;
        }

        return {
            admittingProvider: admittingProvider
            , attendingProvider: attendingProvider
            , referringProvider: referringProvider
        };
    }
}