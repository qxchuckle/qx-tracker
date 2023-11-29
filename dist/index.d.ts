interface DefaultOptions {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    errorTracker: boolean;
    domTracker: boolean;
    domEventsList: Set<keyof HTMLElementEventMap>;
    performanceTracker: boolean;
    extra: Record<string, any> | undefined;
    sdkVersion: string | number;
    log: boolean;
    realTime: boolean;
    maxSize: number;
}
interface Options extends Partial<DefaultOptions> {
    requestUrl: string;
}

declare class Tracker {
    private options;
    private enterTime;
    private report;
    private location;
    constructor(options: Options);
    private init;
    private initDefault;
    private reLocationRecord;
    private captureLocationEvent;
    private historyChangeReport;
    private hashChangeReport;
    private beforeCloseRouterReport;
    private domEventReport;
    private errorReport;
    private errorEvent;
    private promiseReject;
    private performanceReport;
    private decorateData;
    private sendBeacon;
    private reportTracker;
    private beforeCloseReport;
    setUserID<T extends DefaultOptions['uuid']>(uuid: T): void;
    generateUserID(): string | undefined;
    setExtra<T extends DefaultOptions['extra']>(extra: T): void;
    sendTracker<T>(targetKey?: string, data?: T): void;
    sendReport(): boolean;
}

export { Tracker as default };
