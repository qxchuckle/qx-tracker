
import { Options } from "../../types";
import { createHistoryMonitoring, getLocation } from "../../utils";

export default class LocationTracker {
  protected options: Options
  private reportTracker: Function // 上报数据的方法
  private enterTime: number   // 记录用户进入当前页面时的时间戳
  private location: string // 记录用户当前页面

  constructor(options: Options, reportTracker: Function) {
    this.options = options;
    this.reportTracker = reportTracker;
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
      this.reportTracker(d, 'router');
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
  private beforeCloseRouterReport() {
    if (!this.options.realTime) {
      return;
    }
    // 在页面关闭前上报数据
    window.addEventListener("beforeunload", () => {
      const d = {
        event: 'beforeunload',
        targetKey: 'close',
        location: this.location,
        duration: new Date().getTime() - this.enterTime,
      }
      this.reportTracker(d, 'router');
    });
  }
  // 给外部提供页面信息
  public getLocation(): string {
    return this.location
  }
}