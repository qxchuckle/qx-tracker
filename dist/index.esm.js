var TrackerConfig;
(function (TrackerConfig) {
    TrackerConfig["version"] = "1.0.0";
})(TrackerConfig || (TrackerConfig = {}));

const createHistoryEvnent = (type, eventName) => {
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        window.dispatchEvent(new Event(type));
        window.dispatchEvent(new Event(eventName));
        return res;
    };
};
function createHistoryMonitoring(eventName = 'historyChange') {
    window.history['pushState'] = createHistoryEvnent("pushState", eventName);
    window.history['replaceState'] = createHistoryEvnent("replaceState", eventName);
    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event(eventName));
    });
}
function getLocation() {
    return window.location.pathname + window.location.hash;
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
            size: i.transferSize.toFixed(accuracy),
            protocol: i.nextHopProtocol,
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

class Tracker {
    options;
    enterTime;
    report = {};
    location;
    constructor(options) {
        this.options = Object.assign(this.initDefault(), options);
        this.enterTime = new Date().getTime();
        this.location = getLocation();
        this.init();
    }
    init() {
        try {
            if (this.options.historyTracker) {
                this.historyChangeReport();
            }
            if (this.options.hashTracker) {
                this.hashChangeReport();
            }
            if (this.options.historyTracker || this.options.hashTracker) {
                this.beforeCloseRouterReport();
            }
            if (this.options.domTracker) {
                this.domEventReport();
            }
            if (this.options.errorTracker) {
                this.errorReport();
            }
            if (this.options.performanceTracker) {
                this.performanceReport();
            }
            if (!this.options.realTime) {
                this.beforeCloseReport();
            }
        }
        catch (e) {
            this.reportTracker({
                targetKey: "tracker",
                message: "Tracker is error"
            }, 'error');
            if (this.options.log) {
                console.error('Tracker is error');
            }
        }
        if (this.options.log) {
            console.log('Tracker is OK');
        }
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
    reLocationRecord() {
        this.enterTime = new Date().getTime();
        this.location = getLocation();
    }
    captureLocationEvent(event, targetKey, data) {
        window.addEventListener(event, () => {
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
        });
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
        window.addEventListener("beforeunload", () => {
            const d = {
                event: 'beforeunload',
                targetKey: 'close',
                location: this.location,
                duration: new Date().getTime() - this.enterTime,
            };
            this.reportTracker(d, 'router');
        });
    }
    domEventReport(data) {
        this.options.domEventsList?.forEach(event => {
            window.addEventListener(event, (e) => {
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
                            innerText: target.innerText,
                        },
                        data,
                    }, 'dom');
                }
            });
        });
    }
    errorReport() {
        this.errorEvent();
        this.promiseReject();
    }
    errorEvent() {
        window.addEventListener('error', (e) => {
            this.reportTracker({
                targetKey: 'message',
                event: 'error',
                message: e.message
            }, 'error');
        }, true);
    }
    promiseReject() {
        window.addEventListener('unhandledrejection', (event) => {
            event.promise.catch(error => {
                this.reportTracker({
                    targetKey: "reject",
                    event: "promise",
                    message: error
                }, 'error');
            });
        });
    }
    performanceReport(accuracy = 2) {
        window.addEventListener('load', () => {
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
                const data = {
                    targetKey: 'resourceLoad',
                    event: 'load',
                    resource: {
                        name: entry.name,
                        duration: entry.duration.toFixed(accuracy),
                        type: entry.entryType
                    }
                };
                this.reportTracker(data, 'performance');
            });
        });
    }
    decorateData(data) {
        return Object.assign({}, {
            uuid: this.options.uuid,
            time: new Date().getTime(),
            location: this.location,
            extra: this.options.extra,
        }, data);
    }
    sendBeacon(params) {
        if (Object.keys(params).length <= 0) {
            return false;
        }
        const blob = new Blob([JSON.stringify(params)], {
            type: 'application/x-www-form-urlencoded'
        });
        const state = navigator.sendBeacon(this.options.requestUrl, blob);
        return state;
    }
    reportTracker(data, key) {
        const params = this.decorateData(data);
        if (this.options.realTime) {
            return this.sendBeacon(params);
        }
        else {
            if (this.options.maxSize && JSON.stringify(this.report).length * 2 > (this.options.maxSize || 10000)) {
                this.sendReport();
            }
            !this.report.hasOwnProperty(key) && (this.report[key] = []);
            this.report[key].push(params);
            return true;
        }
    }
    beforeCloseReport() {
        window.addEventListener("beforeunload", () => {
            this.sendReport();
        });
    }
    setUserID(uuid) {
        this.options.uuid = uuid;
    }
    generateUserID() {
        return getCanvasID();
    }
    setExtra(extra) {
        this.options.extra = extra;
    }
    sendTracker(targetKey = 'manual', data) {
        this.reportTracker({
            event: 'manual',
            targetKey,
            data,
        }, 'manual');
    }
    sendReport() {
        const state = this.sendBeacon(this.report);
        state && (this.report = {});
        return state;
    }
}

export { Tracker as default };
