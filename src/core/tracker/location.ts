import { Options } from "../../types";
import TrackerCls from "./trackerCls";
import { createHistoryMonitoring, getLocation } from "../../utils";

export default class LocationTracker extends TrackerCls {
  private enterTime: number | undefined = undefined; // 记录用户进入当前页面时的时间戳
  private location: string | undefined = undefined; // 记录用户当前页面

  constructor(options: Options, reportTracker: Function) {
    // 调用父类的构造函数
    super(options, reportTracker);
    // 初始化用户进入当前页面的时间戳和当前页面
    this.reLocationRecord();
  }
  // 初始化
  public init() {
    // 如果开启了history监控，就监听history变化
    if (this.options.historyTracker) {
      this.historyChangeReport();
    }
    // 如果开启了hash监控，就监听hash变化
    if (this.options.hashTracker) {
      this.hashChangeReport();
    }
    // 如果开启了任意路由监控，则开启页面关闭前上报关闭信息
    if (this.options.historyTracker || this.options.hashTracker) {
      this.beforeCloseRouterReport();
    }
  }
  // 销毁时额外需要销毁的内容
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
    // 回调
    const eventHandler: EventListenerOrEventListenerObject = () => {
      // 数据
      const d = {
        event, // 事件类型
        targetKey, // 目标key，按后端需要自定义，默认为 history-pv 或 hash-pv
        location: this.location, // 原路由
        targetLocation: getLocation(), // 当前路由，也就是目标路由
        // 用户访问该路由时长
        duration: new Date().getTime() - this.enterTime!,
        data, // 额外的数据
      };
      // 上报数据
      this.reportTracker(d, "router");
      // 更新当前路径和进入时间
      this.reLocationRecord();
    };
    // 监听事件
    this.addEventListener(event, eventHandler);
  }
  // 监听history变化
  private historyChangeReport(eventName: string = "historyChange") {
    // 创建History变化的统一事件
    createHistoryMonitoring(eventName);
    // 监听该事件
    this.captureLocationEvent(eventName, "history-pv");
  }
  // 监听hash变化
  private hashChangeReport() {
    // 也就是监听hashchange事件
    this.captureLocationEvent("hashchange", "hash-pv");
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
        targetKey: "close",
        location: this.location,
        duration: new Date().getTime() - this.enterTime!,
      };
      this.reportTracker(d, "router");
    };
    this.addEventListener(eventName, eventHandler);
  }
  // 给外部提供页面信息
  public getLocation(): string {
    return this.location!;
  }
}
