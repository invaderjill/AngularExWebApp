export enum LogSeverity {
    Info,
    Error
}

export class Logging {
    logMessage(className: string, method: string, message: string, logSeverity: LogSeverity): void {
        if (logSeverity == LogSeverity.Info) {
            console.log(`${className}.${method}: ${message}`);
            return;
        }

        if (logSeverity == LogSeverity.Error) {
            console.error(`${className}.${method}: ${message}`);
            return;
        }
    }
}