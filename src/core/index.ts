import * as types from "../types";
import { createHistoryMonitoring, getCanvasID, getLocation } from "../utils";

export default class Tracker {
  private options: types.Options
  // 记录用户进入当前页面时的时间戳
  private enterTime: number
  // 记录用户当前页面
  private location: string
  constructor(options: types.Options) {
    // 合并默认和用户传入设置，用户传入设置优先级高
    this.options = Object.assign(this.initDefault(), options);
    this.enterTime = new Date().getTime();
    this.location = getLocation();
    this.init();
  }
  // 初始化设置，并且初始化监听事件
  private init() {
    try {
      if (this.options.historyTracker) {
        this.historyChangeReport()
      }
      if (this.options.hashTracker) {
        this.hashChangeReport()
      }
      if (this.options.historyTracker || this.options.hashTracker) {
        this.beforeCloseReport()
      }
      if (this.options.domTracker) {
        this.domEventReport()
      }
      if (this.options.errorTracker) {
        this.errorReport()
      }
    } catch (e) {
      this.reportTracker({
        targetKey: "tracker",
        message: "Tracker is error"
      })
      if (this.options.log) {
        console.error('Tracker is error');
      }
    }
    if (this.options.log) {
      console.log('Tracker is OK');
    }
  }
  // 初始化配置项
  private initDefault(): types.DefaultOptions {
    return <types.DefaultOptions>{
      uuid: this.generateUserID(),
      requestUrl: undefined,
      historyTracker: false,
      hashTracker: false,
      errorTracker: false,
      domTracker: false,
      // 默认监听的dom事件
      domEventsList: ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover'],
      extra: undefined,
      sdkVersion: types.TrackerConfig.version,
      log: true,
    }
  }
  // 更新当前路径和进入时间
  private reLocationRecord() {
    this.enterTime = new Date().getTime();
    this.location = getLocation();
  }
  // 进行location监听
  private captureLocationEvent<T>(event: string, targetKey: string, data?: T) {
    window.addEventListener(event, () => {
      const d = {
        event, // 事件类型
        targetKey, // 目标key，按后端需要自定义
        location: this.location,
        targetLocation: getLocation(),
        // 用户访问该路由时长
        duration: new Date().getTime() - this.enterTime,
        data, // 额外的数据
      }
      // console.log(d);
      this.reportTracker(d);
      this.reLocationRecord();
    })
  }
  // 监听history变化
  private historyChangeReport(eventName: string = 'historyChange') {
    // 创建History统一事件
    createHistoryMonitoring(eventName);
    this.captureLocationEvent(eventName, 'history-pv');
  }
  // 监听hash变化
  private hashChangeReport() {
    this.captureLocationEvent('hashchange', 'hash-pv')
  }
  // 页面关闭前上报
  private beforeCloseReport() {
    // 在页面关闭前上报数据
    window.addEventListener("beforeunload", () => {
      const d = {
        event: 'beforeunload',
        targetKey: 'close',
        location: this.location,
        duration: new Date().getTime() - this.enterTime,
      }
      this.reportTracker(d);
    });
  }
  // 监听dom事件，并上报相关数据
  private domEventReport<T>(data?: T) {
    this.options.domEventsList?.forEach(event => {
      window.addEventListener(event, (e) => {
        const target = e.target as HTMLElement;
        // 设置target-events属性，元素层次限制上报的事件
        const targetEvents = JSON.stringify(target.getAttribute('target-events'));
        if (targetEvents && !targetEvents.includes(e.type)) {
          return;
        }
        // 获取目标key，设置key分辨不同元素
        // <button target-key="btn" target-events="['click']">dom事件上报测试</button>
        const targetKey = target.getAttribute('target-key');
        if (targetKey) {
          // console.log(e);
          this.reportTracker({
            event,
            targetKey,
            // 元素的基本信息，便于定位
            elementInfo: {
              name: target.localName ?? target.nodeName,
              id: target.id,
              classList: Array.from(target.classList),
              innerText: target.innerText,
            },
            data,
          })
        }
      })
    })
  }
  private errorReport() {
    this.errorEvent()
    this.promiseReject()
  }
  //捕获报错
  private errorEvent() {
    window.addEventListener('error', (e) => {
      this.reportTracker({
        targetKey: 'message',
        event: 'error',
        message: e.message
      })
    }, true)
  }
  //捕获promise 错误
  private promiseReject() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch(error => {
        this.reportTracker({
          targetKey: "reject",
          event: "promise",
          message: error
        })
      })
    })
  }
  // 上报
  private reportTracker<T>(data: T) {
    const params = Object.assign({}, {
      uuid: this.options.uuid,
      time: new Date().getTime(),
      location: this.location,
      extra: this.options.extra,
    }, data);
    const headers = {
      type: 'application/x-www-form-urlencoded'
    }
    const blob = new Blob([JSON.stringify(params)], headers);
    navigator.sendBeacon(this.options.requestUrl, blob)
  }
  // 允许外部设置uuid
  public setUserID<T extends types.DefaultOptions['uuid']>(uuid: T) {
    this.options.uuid = uuid;
  }
  // 生成uuid
  public generateUserID(): string | undefined {
    return getCanvasID()
  }
  // 外部设置额外参数
  public setExtra<T extends types.DefaultOptions['extra']>(extra: T) {
    this.options.extra = extra;
  }
  // 主动上报
  public sendTracker<T>(targetKey: string = 'manual', data?: T) {
    this.reportTracker({
      event: 'manual',
      targetKey,
      data,
    })
  }
}




