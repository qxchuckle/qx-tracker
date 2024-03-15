declare class TrackerOptions {
    protected options: Options;
    constructor(options: Options);
    private initDefault;
    generateUserID(): string | undefined;
}

type Optional<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
interface DefaultOptions {
    requestUrl: string;
    uuid: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    errorTracker: boolean;
    domTracker: boolean;
    domEventsList: Set<keyof HTMLElementEventMap>;
    performanceTracker: boolean;
    navigatorTracker: boolean;
    extra: Record<string, any> | undefined;
    sdkVersion: string | number;
    log: boolean;
    realTime: boolean;
    maxSize: number;
}
type Options = Optional<DefaultOptions, 'requestUrl'>;

declare class Tracker extends TrackerOptions {
    private report;
    private trackers;
    private stringSizeCalculation;
    private beforeCloseHandler;
    isDestroy: boolean;
    constructor(options: Options);
    private init;
    private decorateData;
    private reportTracker;
    private beforeCloseReport;
    setUserID<T extends DefaultOptions["uuid"]>(uuid: T): void;
    setExtra<T extends DefaultOptions["extra"]>(extra: T): void;
    sendTracker<T>(targetKey?: string, data?: T): void;
    sendReport(): boolean;
    destroy(): void;
}

export { Tracker as default };
