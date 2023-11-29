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

declare class TrackerOptions {
    protected options: Options;
    constructor(options: Options);
    private initDefault;
    generateUserID(): string | undefined;
}

declare class Tracker extends TrackerOptions {
    private report;
    private locationTracker;
    private domTracker;
    private errorTracker;
    private performanceTracker;
    constructor(options: Options);
    private init;
    private decorateData;
    private reportTracker;
    private beforeCloseReport;
    setUserID<T extends DefaultOptions['uuid']>(uuid: T): void;
    setExtra<T extends DefaultOptions['extra']>(extra: T): void;
    sendTracker<T>(targetKey?: string, data?: T): void;
    sendReport(): boolean;
}

export { Tracker as default };
