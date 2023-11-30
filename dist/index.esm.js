const createHistoryEvent = (type, eventName) => {
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        window.dispatchEvent(new Event(type));
        window.dispatchEvent(new Event(eventName));
        return res;
    };
};
function createHistoryMonitoring(eventName = 'historyChange') {
    window.history['pushState'] = createHistoryEvent("pushState", eventName);
    window.history['replaceState'] = createHistoryEvent("replaceState", eventName);
    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event(eventName));
    });
}
function getLocation() {
    return window.location.pathname + window.location.hash;
}

function sendBeacon(url, params) {
    if (Object.keys(params).length <= 0) {
        return false;
    }
    const blob = new Blob([JSON.stringify(params)], {
        type: 'application/x-www-form-urlencoded'
    });
    const state = navigator.sendBeacon(url, blob);
    return state;
}

function getDomPerformance(accuracy = 2) {
    const performanceData = performance.getEntriesByType('navigation')[0];
    if (!performanceData)
        return null;
    return {
        startTime: performanceData.startTime.toFixed(accuracy),
        whiteScreen: performance.getEntriesByType('paint')[0]?.startTime.toFixed(accuracy),
        load: (performanceData.loadEventEnd - performanceData.startTime).toFixed(accuracy),
        dom: (performanceData.domContentLoadedEventEnd - performanceData.responseEnd).toFixed(accuracy),
        domComplete: performanceData.domComplete.toFixed(accuracy),
        resource: (performanceData.loadEventEnd - performanceData.domContentLoadedEventEnd).toFixed(accuracy),
        htmlLoad: (performanceData.responseEnd - performanceData.startTime).toFixed(accuracy),
        firstInteraction: (performanceData.domInteractive - performanceData.startTime).toFixed(accuracy),
        secureConnectionStart: performanceData.secureConnectionStart.toFixed(accuracy),
    };
}
function getResourcePerformance(accuracy = 2) {
    if (!window.performance)
        return null;
    const data = window.performance.getEntriesByType('resource');
    const resources = {};
    data.forEach(item => {
        const i = item;
        let key = i.initiatorType || 'other';
        if (key === 'other') {
            const extension = urlHandle(i.name, 2);
            switch (extension) {
                case 'css':
                    key = 'css';
                    break;
                case 'js':
                    key = 'js';
                    break;
                case 'json':
                    key = 'json';
                    break;
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'svg':
                    key = 'img';
                    break;
            }
        }
        !resources.hasOwnProperty(key) && (resources[key] = []);
        resources[key].push({
            name: i.name,
            duration: i.duration.toFixed(accuracy),
            type: i.entryType,
            initiatorType: i.initiatorType,
            size: i.decodedBodySize || i.transferSize,
        });
    });
    return resources;
}
function listenResourceLoad(callback) {
    const observer = new PerformanceObserver((list, _observer) => {
        list.getEntries().forEach((entry) => {
            const e = entry;
            if (e.initiatorType !== "beacon") {
                callback(e);
            }
        });
    });
    observer.observe({
        entryTypes: ["resource"],
    });
}
function urlHandle(url, type) {
    let filename = url.substring(url.lastIndexOf('/') + 1);
    switch (type) {
        case 1:
            return filename;
        case 2:
            return filename.substring(filename.lastIndexOf(".") + 1);
        case 3:
            return filename.substring(0, filename.lastIndexOf("."));
        case 4:
            return url.substring(0, url.lastIndexOf('/') + 1);
        default: return undefined;
    }
}

function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).slice(0, 8);
}
function getCanvasID(str = '#qx.chuckle,123456789<canvas>') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return undefined;
    }
    var txt = str;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
    const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
    return generateHash(atob(b64));
}

function createStringSizeCalculation() {
    const textEncode = new TextEncoder();
    return function (str) {
        return textEncode.encode(str).length;
    };
}

var TrackerConfig;
(function (TrackerConfig) {
    TrackerConfig["version"] = "1.0.0";
})(TrackerConfig || (TrackerConfig = {}));

class TrackerOptions {
    options;
    constructor(options) {
        this.options = Object.assign(this.initDefault(), options);
    }
    initDefault() {
        return {
            uuid: this.generateUserID(),
            requestUrl: undefined,
            historyTracker: false,
            hashTracker: false,
            errorTracker: false,
            domTracker: false,
            domEventsList: new Set(['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover']),
            performanceTracker: false,
            extra: undefined,
            sdkVersion: TrackerConfig.version,
            log: true,
            realTime: false,
            maxSize: 1024 * 50
        };
    }
    generateUserID() {
        return getCanvasID();
    }
}

class TrackerCls {
    options;
    reportTracker;
    eventListeners = {};
    constructor(options, reportTracker) {
        this.options = options;
        this.reportTracker = reportTracker;
    }
    addEventListener(name, handler, options = false) {
        !this.eventListeners.hasOwnProperty(name) && (this.eventListeners[name] = []);
        this.eventListeners[name].push(handler);
        window.addEventListener(name, handler, options);
    }
    destroy() {
        for (const eventName in this.eventListeners) {
            const listeners = this.eventListeners[eventName];
            for (const listener of listeners) {
                window.removeEventListener(eventName, listener);
            }
        }
        this.eventListeners = {};
    }
}

class LocationTracker extends TrackerCls {
    enterTime;
    location;
    constructor(options, reportTracker) {
        super(options, reportTracker);
        this.options = options;
        this.reportTracker = reportTracker;
        this.enterTime = new Date().getTime();
        this.location = getLocation();
    }
    init() {
        if (this.options.historyTracker) {
            this.historyChangeReport();
        }
        if (this.options.hashTracker) {
            this.hashChangeReport();
        }
        if (this.options.historyTracker || this.options.hashTracker) {
            this.beforeCloseRouterReport();
        }
    }
    reLocationRecord() {
        this.enterTime = new Date().getTime();
        this.location = getLocation();
    }
    captureLocationEvent(event, targetKey, data) {
        const eventHandler = () => {
            const d = {
                event,
                targetKey,
                location: this.location,
                targetLocation: getLocation(),
                duration: new Date().getTime() - this.enterTime,
                data,
            };
            this.reportTracker(d, 'router');
            this.reLocationRecord();
        };
        this.addEventListener(event, eventHandler);
    }
    historyChangeReport(eventName = 'historyChange') {
        createHistoryMonitoring(eventName);
        this.captureLocationEvent(eventName, 'history-pv');
    }
    hashChangeReport() {
        this.captureLocationEvent('hashchange', 'hash-pv');
    }
    beforeCloseRouterReport() {
        if (!this.options.realTime) {
            return;
        }
        const eventName = "beforeunload";
        const eventHandler = () => {
            const d = {
                event: eventName,
                targetKey: 'close',
                location: this.location,
                duration: new Date().getTime() - this.enterTime,
            };
            this.reportTracker(d, 'router');
        };
        this.addEventListener(eventName, eventHandler);
    }
    getLocation() {
        return this.location;
    }
}

class DomTracker extends TrackerCls {
    constructor(options, reportTracker) {
        super(options, reportTracker);
        this.options = options;
        this.reportTracker = reportTracker;
    }
    init() {
        if (this.options.domTracker) {
            this.domEventReport();
        }
    }
    domEventReport() {
        this.options.domEventsList?.forEach(event => {
            const eventHandler = (e) => {
                const target = e.target;
                const targetEvents = JSON.stringify(target.getAttribute('target-events'));
                if (targetEvents && !targetEvents.includes(e.type)) {
                    return;
                }
                const targetKey = target.getAttribute('target-key');
                if (targetKey) {
                    this.reportTracker({
                        event,
                        targetKey,
                        elementInfo: {
                            name: target.localName ?? target.nodeName,
                            id: target.id,
                            classList: Array.from(target.classList),
                        }
                    }, 'dom');
                }
            };
            this.addEventListener(event, eventHandler);
        });
    }
}

class ErrorTracker extends TrackerCls {
    constructor(options, reportTracker) {
        super(options, reportTracker);
        this.options = options;
        this.reportTracker = reportTracker;
    }
    init() {
        if (this.options.errorTracker) {
            this.errorReport();
        }
    }
    errorReport() {
        this.errorEvent();
        this.promiseReject();
    }
    errorEvent() {
        const eventName = 'error';
        const eventHandler = (e) => {
            const [info, targetKey] = this.analyzeError(e);
            this.reportTracker({
                targetKey: targetKey,
                event: 'error',
                info: info
            }, 'error');
        };
        this.addEventListener(eventName, eventHandler, true);
    }
    analyzeError(event) {
        const target = event.target || event.srcElement;
        if (target instanceof HTMLElement) {
            return [{
                    name: target.tagName || target.localName || target.nodeName,
                    url: target.src || target.href,
                }, "resource"];
        }
        if (event instanceof ErrorEvent) {
            return [event.message, "js"];
        }
        return [event, "other"];
    }
    promiseReject() {
        const eventName = 'unhandledrejection';
        const eventHandler = (event) => {
            event.promise.catch(error => {
                this.reportTracker({
                    targetKey: "reject",
                    event: "promise",
                    info: error
                }, 'error');
            });
        };
        this.addEventListener(eventName, eventHandler);
    }
}

class PerformanceTracker extends TrackerCls {
    constructor(options, reportTracker) {
        super(options, reportTracker);
        this.options = options;
        this.reportTracker = reportTracker;
    }
    init() {
        if (this.options.performanceTracker) {
            this.performanceReport();
        }
    }
    performanceReport(accuracy = 2) {
        const eventName = 'load';
        const eventHandler = () => {
            const domPerformance = getDomPerformance(accuracy);
            const resourcePerformance = getResourcePerformance(accuracy);
            const data = {
                targetKey: 'performance',
                event: 'load',
                domPerformance,
                resourcePerformance
            };
            this.reportTracker(data, 'performance');
            listenResourceLoad((entry) => {
                const resource = {
                    name: entry.name,
                    duration: entry.duration.toFixed(accuracy),
                    type: entry.entryType,
                    initiatorType: entry.initiatorType,
                    size: entry.decodedBodySize || entry.transferSize,
                };
                const data = {
                    targetKey: 'resource',
                    event: 'load',
                    resource,
                };
                this.reportTracker(data, 'performance');
            });
        };
        this.addEventListener(eventName, eventHandler);
    }
}

class Tracker extends TrackerOptions {
    report = {};
    locationTracker = undefined;
    domTracker = undefined;
    errorTracker = undefined;
    performanceTracker = undefined;
    stringSizeCalculation = undefined;
    beforeCloseHandler = undefined;
    isDestroy = false;
    constructor(options) {
        super(options);
        this.locationTracker = new LocationTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.domTracker = new DomTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.errorTracker = new ErrorTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.performanceTracker = new PerformanceTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.init();
    }
    init() {
        try {
            this.locationTracker?.init();
            this.domTracker?.init();
            this.errorTracker?.init();
            this.performanceTracker?.init();
            if (!this.options.realTime) {
                this.stringSizeCalculation = createStringSizeCalculation();
                this.beforeCloseReport();
            }
            this.options.log && console.log('Tracker is OK');
        }
        catch (e) {
            sendBeacon(this.options.requestUrl, this.decorateData({
                targetKey: "tracker",
                event: "error",
                message: e,
            }));
            this.options.log && console.error('Tracker is error');
        }
    }
    decorateData(data) {
        return Object.assign({}, {
            uuid: this.options.uuid,
            time: new Date().getTime(),
            location: this.locationTracker?.getLocation(),
            extra: this.options.extra,
        }, data);
    }
    reportTracker(data, key) {
        const params = this.decorateData(data);
        if (this.options.realTime) {
            return sendBeacon(this.options.requestUrl, params);
        }
        else {
            const size = this.stringSizeCalculation && this.stringSizeCalculation(JSON.stringify(this.report));
            if (this.options.maxSize && size && size > (this.options.maxSize || 10000)) {
                this.sendReport();
            }
            !this.report.hasOwnProperty(key) && (this.report[key] = []);
            this.report[key].push(params);
            return true;
        }
    }
    beforeCloseReport() {
        this.beforeCloseHandler = () => {
            this.sendReport();
        };
        window.addEventListener("beforeunload", this.beforeCloseHandler);
    }
    setUserID(uuid) {
        if (this.isDestroy)
            return;
        this.options.uuid = uuid;
    }
    setExtra(extra) {
        if (this.isDestroy)
            return;
        this.options.extra = extra;
    }
    sendTracker(targetKey = 'manual', data) {
        if (this.isDestroy)
            return;
        this.reportTracker({
            event: 'manual',
            targetKey,
            data,
        }, 'manual');
    }
    sendReport() {
        if (this.isDestroy)
            return false;
        const state = sendBeacon(this.options.requestUrl, this.report);
        state && (this.report = {});
        return state;
    }
    destroy() {
        if (this.isDestroy)
            return;
        this.sendReport();
        this.locationTracker?.destroy();
        this.domTracker?.destroy();
        this.errorTracker?.destroy();
        this.performanceTracker?.destroy();
        this.beforeCloseHandler && window.removeEventListener("beforeunload", this.beforeCloseHandler);
        this.locationTracker = undefined;
        this.domTracker = undefined;
        this.errorTracker = undefined;
        this.performanceTracker = undefined;
        this.stringSizeCalculation = undefined;
        this.beforeCloseHandler = undefined;
        this.isDestroy = true;
    }
}

export { Tracker as default };
