'use strict';

const createHistoryEvent = (type, eventName) => {
    const origin = history[type];
    const e = new Event(eventName);
    const typeEvent = new Event(type);
    return function () {
        const res = origin.apply(this, arguments);
        window.dispatchEvent(typeEvent);
        window.dispatchEvent(e);
        return res;
    };
};
function createHistoryMonitoring(eventName = "historyChange") {
    window.history["pushState"] = createHistoryEvent("pushState", eventName);
    window.history["replaceState"] = createHistoryEvent("replaceState", eventName);
    window.addEventListener("popstate", () => {
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
    const state = navigator.sendBeacon(url, JSON.stringify(params));
    return state;
}

function getDomPerformance(accuracy = 2) {
    const navigationTiming = window.performance.getEntriesByType('navigation')[0] || performance.timing;
    const firstPaintTiming = window.performance.getEntriesByType('paint')[0];
    const firstContentfulPaintTiming = window.performance.getEntriesByType('paint')[1];
    if (!navigationTiming)
        return null;
    const sslTime = navigationTiming.secureConnectionStart;
    return {
        startTime: navigationTiming.startTime.toFixed(accuracy),
        duration: (navigationTiming.duration).toFixed(accuracy),
        DNS: (navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart).toFixed(accuracy),
        TCP: (navigationTiming.connectEnd - navigationTiming.connectStart).toFixed(accuracy),
        SSL: (sslTime > 0 ? navigationTiming.connectEnd - sslTime : 0).toFixed(accuracy),
        TTFB: (navigationTiming.responseStart - navigationTiming.requestStart).toFixed(accuracy),
        FP: (firstPaintTiming ? firstPaintTiming.startTime - navigationTiming.fetchStart : navigationTiming.responseEnd - navigationTiming.fetchStart).toFixed(accuracy),
        FCP: (firstContentfulPaintTiming ? firstContentfulPaintTiming.startTime - navigationTiming.fetchStart : 0).toFixed(accuracy),
        TTI: (navigationTiming.domInteractive - navigationTiming.startTime).toFixed(accuracy),
        redirect: (navigationTiming.redirectEnd - navigationTiming.redirectStart).toFixed(accuracy),
        redirectCount: navigationTiming.redirectCount,
        unload: (navigationTiming.unloadEventEnd - navigationTiming.unloadEventStart).toFixed(accuracy),
        ready: (navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime).toFixed(accuracy),
        load: (navigationTiming.loadEventEnd - navigationTiming.startTime).toFixed(accuracy),
        dom: (navigationTiming.domContentLoadedEventEnd - navigationTiming.responseEnd).toFixed(accuracy),
        domComplete: navigationTiming.domComplete.toFixed(accuracy),
        resource: (navigationTiming.domComplete - navigationTiming.domInteractive).toFixed(accuracy),
        htmlLoad: (navigationTiming.responseEnd - navigationTiming.startTime).toFixed(accuracy),
        DCL: (navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart).toFixed(accuracy),
        onload: (navigationTiming.loadEventEnd - navigationTiming.loadEventStart).toFixed(accuracy),
    };
}
function getResourcePerformance(accuracy = 2) {
    if (!window.performance)
        return null;
    const data = window.performance.getEntriesByType('resource');
    const resources = {};
    data.forEach(i => {
        let key = i.initiatorType || 'other';
        if (key === 'beacon')
            return;
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
        list.getEntries().forEach((e) => {
            if (e.initiatorType !== "beacon") {
                callback(e);
            }
        });
    });
    observer.observe({
        entryTypes: ["resource"],
    });
    return observer;
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
    str = atob(str);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}
function getCanvasID(str = '#qx.chuckle,123456789<canvas>') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return undefined;
    }
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(str, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(str, 4, 17);
    const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
    return generateHash(b64);
}

function createStringSizeCalculation() {
    const textEncode = new TextEncoder();
    return function (str) {
        return textEncode.encode(str).length;
    };
}

function createLog() {
    return;
}
const log = createLog();

function getNavigatorInfo() {
    const navigator = window.navigator;
    const ua = navigator.userAgent;
    return {
        userAgent: ua,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        browser: getBrowser(ua),
        os: getOS(ua),
        isMobile: isMobile(ua),
        screen: {
            width: window.screen.width,
            height: window.screen.height,
        }
    };
}
function getBrowser(ua) {
    ua = ua.toLowerCase();
    const browserRegex = {
        Edge: /edge\/([\d.]+)/i,
        IE: /(rv:|msie\s+)([\d.]+)/i,
        Firefox: /firefox\/([\d.]+)/i,
        Chrome: /chrome\/([\d.]+)/i,
        Opera: /opera\/([\d.]+)/i,
        Safari: /version\/([\d.]+).*safari/i
    };
    for (const browser in browserRegex) {
        const match = ua.match(browserRegex[browser]);
        if (match) {
            return { name: browser, version: match[1] };
        }
    }
    return { name: "", version: "0" };
}
function getOS(ua) {
    ua = ua.toLowerCase();
    const osRegex = [
        { name: "windows", regex: /compatible|windows/i },
        { name: "macOS", regex: /macintosh|macintel/i },
        { name: "iOS", regex: /iphone|ipad/i },
        { name: "android", regex: /android/i },
        { name: "linux", regex: /linux/i }
    ];
    for (const os of osRegex) {
        if (ua.match(os.regex)) {
            return os.name;
        }
    }
    return "other";
}
function isMobile(ua) {
    return !!ua.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
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
            requestUrl: "",
            uuid: this.generateUserID(),
            historyTracker: false,
            hashTracker: false,
            errorTracker: false,
            domTracker: false,
            domEventsList: new Set(['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover']),
            performanceTracker: false,
            navigatorTracker: false,
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
        !this.eventListeners.hasOwnProperty(name) &&
            (this.eventListeners[name] = []);
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
        this.additionalDestroy();
    }
}

class LocationTracker extends TrackerCls {
    enterTime = undefined;
    location = undefined;
    constructor(options, reportTracker) {
        super(options, reportTracker);
        this.reLocationRecord();
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
    additionalDestroy() {
        this.enterTime = undefined;
        this.location = undefined;
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
            this.reportTracker(d, "router");
            this.reLocationRecord();
        };
        this.addEventListener(event, eventHandler);
    }
    historyChangeReport(eventName = "historyChange") {
        createHistoryMonitoring(eventName);
        this.captureLocationEvent(eventName, "history-pv");
    }
    hashChangeReport() {
        this.captureLocationEvent("hashchange", "hash-pv");
    }
    beforeCloseRouterReport() {
        if (!this.options.realTime) {
            return;
        }
        const eventName = "beforeunload";
        const eventHandler = () => {
            const d = {
                event: eventName,
                targetKey: "close",
                location: this.location,
                duration: new Date().getTime() - this.enterTime,
            };
            this.reportTracker(d, "router");
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
    }
    init() {
        if (this.options.domTracker) {
            this.domEventReport();
        }
    }
    additionalDestroy() { }
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
                            id: target.id || null,
                            class: target.className || null,
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
    }
    init() {
        if (this.options.errorTracker) {
            this.errorReport();
        }
    }
    additionalDestroy() { }
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
                    class: target.className || null,
                    id: target.id || null,
                    url: target.src || target.href || null,
                }, "resourceError"];
        }
        if (event instanceof ErrorEvent) {
            return [event.message, "jsError"];
        }
        return [event, "otherError"];
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
    performanceObserver = undefined;
    constructor(options, reportTracker) {
        super(options, reportTracker);
    }
    init() {
        if (this.options.performanceTracker) {
            this.performanceReport();
        }
    }
    performanceReport(accuracy = 2) {
        const eventName = "load";
        const performance = () => {
            const domPerformance = getDomPerformance(accuracy);
            const resourcePerformance = getResourcePerformance(accuracy);
            const data = {
                targetKey: "performance",
                event: "load",
                domPerformance,
                resourcePerformance,
            };
            this.reportTracker(data, "performance");
            this.performanceObserver = listenResourceLoad((entry) => {
                const resource = {
                    name: entry.name,
                    duration: entry.duration.toFixed(accuracy),
                    type: entry.entryType,
                    initiatorType: entry.initiatorType,
                    size: entry.decodedBodySize || entry.transferSize,
                };
                const data = {
                    targetKey: "resourceLoad",
                    event: "load",
                    resource,
                };
                this.reportTracker(data, "performance");
            });
        };
        const eventHandler = () => {
            if (typeof Promise === 'function') {
                Promise.resolve().then(() => {
                    setTimeout(performance, 0);
                });
            }
            else {
                setTimeout(performance, 0);
            }
        };
        this.addEventListener(eventName, eventHandler);
    }
    additionalDestroy() {
        this.performanceObserver?.disconnect();
    }
}

class NavigatorTracker extends TrackerCls {
    constructor(options, reportTracker) {
        super(options, reportTracker);
    }
    init() {
        if (this.options.navigatorTracker) {
            this.navigatorReport();
        }
    }
    additionalDestroy() { }
    navigatorReport() {
        this.reportTracker({
            targetKey: 'navigator',
            event: null,
            info: getNavigatorInfo(),
        }, 'navigator');
    }
}

class Tracker extends TrackerOptions {
    report = {};
    trackers = {
        locationTracker: undefined,
        domTracker: undefined,
        errorTracker: undefined,
        performanceTracker: undefined,
        navigatorTracker: undefined,
    };
    stringSizeCalculation = undefined;
    beforeCloseHandler = undefined;
    isDestroy = false;
    constructor(options) {
        super(options);
        this.trackers.locationTracker = new LocationTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.trackers.domTracker = new DomTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.trackers.errorTracker = new ErrorTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.trackers.performanceTracker = new PerformanceTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.trackers.navigatorTracker = new NavigatorTracker(this.options, (data, key) => this.reportTracker(data, key));
        this.init();
    }
    init() {
        try {
            for (const key in this.trackers) {
                this.trackers[key]?.init();
            }
            if (!this.options.realTime) {
                this.stringSizeCalculation = createStringSizeCalculation();
                this.beforeCloseReport();
            }
            this.options.log && console.log("Tracker is OK");
        }
        catch (e) {
            sendBeacon(this.options.requestUrl, this.decorateData({
                targetKey: "tracker",
                event: "error",
                message: e,
            }));
            this.options.log && console.error("Tracker is error");
        }
    }
    decorateData(data) {
        return Object.assign({}, {
            uuid: this.options.uuid,
            time: new Date().getTime(),
            location: this.trackers.locationTracker?.getLocation(),
            extra: this.options.extra,
        }, data);
    }
    reportTracker(data, key) {
        const params = this.decorateData(data);
        if (this.options.realTime) {
            return sendBeacon(this.options.requestUrl, params);
        }
        else {
            !this.report.hasOwnProperty(key) && (this.report[key] = []);
            this.report[key].push(params);
            const size = this.stringSizeCalculation &&
                this.stringSizeCalculation(JSON.stringify(this.report));
            log && log(size, params);
            if (this.options.maxSize &&
                size &&
                size > (this.options.maxSize || 10000)) {
                this.sendReport();
            }
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
    sendTracker(targetKey = "manual", data) {
        if (this.isDestroy)
            return;
        this.reportTracker({
            event: "manual",
            targetKey,
            data,
        }, "manual");
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
        for (const key in this.trackers) {
            this.trackers[key]?.destroy();
            this.trackers[key] = undefined;
        }
        this.beforeCloseHandler &&
            window.removeEventListener("beforeunload", this.beforeCloseHandler);
        this.stringSizeCalculation = undefined;
        this.beforeCloseHandler = undefined;
        this.isDestroy = true;
    }
}

module.exports = Tracker;
