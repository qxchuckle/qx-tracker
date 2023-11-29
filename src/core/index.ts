import * as types from "../types";
import { sendBeacon } from "../utils";
import { TrackerOptions, LocationTracker, DomTracker, ErrorTracker, PerformanceTracker } from "./tracker";

export default class Tracker extends TrackerOptions {
  private report: types.Report = {} // 暂存数据
  private locationTracker: LocationTracker
  private domTracker: DomTracker
  private errorTracker: ErrorTracker
  private performanceTracker: PerformanceTracker

  constructor(options: types.Options) {
    super(options);
    // 创建各种Tracker的实例，将配置和上报方法传入
    this.locationTracker = new LocationTracker(this.options, <T>(data: T, key: string) => this.reportTracker(data, key));
    this.domTracker = new DomTracker(this.options, <T>(data: T, key: string) => this.reportTracker(data, key));
    this.errorTracker = new ErrorTracker(this.options, <T>(data: T, key: string) => this.reportTracker(data, key));
    this.performanceTracker = new PerformanceTracker(this.options, <T>(data: T, key: string) => this.reportTracker(data, key));
    this.init();
  }
  // 初始化设置，并且初始化监听事件
  private init() {
    try {
      this.locationTracker.init();
      this.domTracker.init();
      this.errorTracker.init();
      this.performanceTracker.init();
      if (!this.options.realTime) {
        this.beforeCloseReport()
      }
    } catch (e) {
      this.reportTracker({
        targetKey: "tracker",
        message: "Tracker is error"
      }, 'error')
      if (this.options.log) {
        console.error('Tracker is error');
      }
    }
    if (this.options.log) {
      console.log('Tracker is OK');
    }
  }
  // 修饰数据，加上统一信息
  private decorateData<T>(data: T) {
    return Object.assign({}, {
      uuid: this.options.uuid,
      time: new Date().getTime(),
      location: this.locationTracker.getLocation(),
      extra: this.options.extra,
    }, data);
  }
  // 上报
  private reportTracker<T>(data: T, key: string): boolean {
    const params = this.decorateData(data);
    if (this.options.realTime) {
      return sendBeacon(this.options.requestUrl, params);
    } else {
      if (this.options.maxSize && JSON.stringify(this.report).length * 2 > (this.options.maxSize || 10000)) {
        this.sendReport();
      }
      // console.log(JSON.stringify(this.report).length * 2);
      !this.report.hasOwnProperty(key) && (this.report[key] = []);
      this.report[key].push(params);
      return true;
    }
  }
  private beforeCloseReport() {
    window.addEventListener("beforeunload", () => {
      this.sendReport();
    });
  }
  // 允许外部设置uuid
  public setUserID<T extends types.DefaultOptions['uuid']>(uuid: T) {
    this.options.uuid = uuid;
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
    }, 'manual')
  }
  // 手动发送非实时上报模式下累积的数据，用户可以在合适的时候上报数据
  public sendReport(): boolean {
    const state = sendBeacon(this.options.requestUrl, this.report);
    state && (this.report = {});
    return state
  }
}

