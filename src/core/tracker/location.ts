
import { Options } from "../../types";
import TrackerCls from "./trackerCls";
import { createHistoryMonitoring, getLocation } from "../../utils";

export default class LocationTracker extends TrackerCls {
  private enterTime: number | undefined = undefined   // 记录用户进入当前页面时的时间戳
  private location: string | undefined = undefined // 记录用户当前页面

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
    this.enterTime = new Date().getTime();
    this.location = getLocation();
  }
  public init() {
    if (this.options.historyTracker) {
      this.historyChangeReport()
    }
    if (this.options.hashTracker) {
      this.hashChangeReport()
    }
    if (this.options.historyTracker || this.options.hashTracker) {
      this.beforeCloseRouterReport()
    }
  }
  additionalDestroy() {
    this.enterTime = undefined;
    this.location = undefined;
  }
  // 更新当前路径和进入时间
  private reLocationRecord() {
    this.enterTime = new Date().getTime();
    this.location = getLocation();
  }
  // 进行location监听
  private captureLocationEvent<T>(event: string, targetKey: string, data?: T) {
    const eventHandler: EventListenerOrEventListenerObject = () => {
      const d = {
        event, // 事件类型
        targetKey, // 目标key，按后端需要自定义
        location: this.location,
        targetLocation: getLocation(),
        // 用户访问该路由时长
        duration: new Date().getTime() - this.enterTime!,
        data, // 额外的数据
      }
      this.reportTracker(d, 'router');
      this.reLocationRecord();
    }
    this.addEventListener(event, eventHandler)
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
  private beforeCloseRouterReport() {
    if (!this.options.realTime) {
      return;
    }
    const eventName = "beforeunload";
    const eventHandler: EventListenerOrEventListenerObject = () => {
      const d = {
        event: eventName,
        targetKey: 'close',
        location: this.location,
        duration: new Date().getTime() - this.enterTime!,
      }
      this.reportTracker(d, 'router');
    }
    this.addEventListener(eventName, eventHandler)
  }
  // 给外部提供页面信息
  public getLocation(): string {
    return this.location!
  }
}