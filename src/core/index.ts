import { Report, Options, DefaultOptions, Trackers } from "../types";
import { sendBeacon, createStringSizeCalculation, log } from "../utils";
import {
  TrackerOptions,
  LocationTracker,
  DomTracker,
  ErrorTracker,
  PerformanceTracker,
  NavigatorTracker,
} from "./tracker";

export default class Tracker extends TrackerOptions {
  private report: Report = {}; // 暂存上报数据
  // 存储各种Tracker的实例
  private trackers: Trackers = {
    locationTracker: undefined, // 路由监控实例
    domTracker: undefined, // dom埋点监控实例
    errorTracker: undefined, // 错误监控实例
    performanceTracker: undefined, // 性能监控实例
    navigatorTracker: undefined, // 用户信息监控实例
  };
  // 存储字符串大小计算方法
  private stringSizeCalculation: Function | undefined = undefined;
  // 存储beforeCloseHandler，页面关闭前执行的回调
  private beforeCloseHandler: EventListenerOrEventListenerObject | undefined =
    undefined;
  // 是否销毁的标志变量
  public isDestroy: boolean = false;

  constructor(options: Options) {
    super(options);
    // 创建各种Tracker的实例，将配置和上报方法传入
    this.trackers.locationTracker = new LocationTracker(
      this.options,
      <T>(data: T, key: string) => this.reportTracker(data, key)
    );
    this.trackers.domTracker = new DomTracker(
      this.options,
      <T>(data: T, key: string) => this.reportTracker(data, key)
    );
    this.trackers.errorTracker = new ErrorTracker(
      this.options,
      <T>(data: T, key: string) => this.reportTracker(data, key)
    );
    this.trackers.performanceTracker = new PerformanceTracker(
      this.options,
      <T>(data: T, key: string) => this.reportTracker(data, key)
    );
    this.trackers.navigatorTracker = new NavigatorTracker(
      this.options,
      <T>(data: T, key: string) => this.reportTracker(data, key)
    );
    // 调用初始化方法
    this.init();
  }
  // 初始化
  private init() {
    try {
      // 遍历所有Tracker实例，调用其初始化方法
      for (const key in this.trackers) {
        this.trackers[key as keyof Trackers]?.init();
      }
      // 如果不是实时上报模式，初始化beforeCloseReport，主类控制在页面关闭前上报
      if (!this.options.realTime) {
        // 创建字符串大小计算方法
        this.stringSizeCalculation = createStringSizeCalculation();
        this.beforeCloseReport();
      }
      // 如果允许log，则打印初始化成功
      this.options.log && console.log("Tracker is OK");
    } catch (e) {
      // console.log(e);
      // 初始化出错，则直接上报错误
      sendBeacon(
        this.options.requestUrl,
        this.decorateData({
          targetKey: "tracker",
          event: "error",
          message: e,
        })
      );
      this.options.log && console.error("Tracker is error");
    }
  }
  // 修饰数据，加上统一信息
  private decorateData<T>(data: T): object {
    // 将传入的数据和统一信息合并
    return Object.assign(
      {},
      {
        uuid: this.options.uuid, // 加上uuid
        time: new Date().getTime(), // 加上时间戳
        location: this.trackers.locationTracker?.getLocation(), // 加上当前路由，由路由监控实例提供
        extra: this.options.extra, // 加上配置项中的额外数据
      },
      data
    );
  }
  // 上报
  private reportTracker<T>(data: T, key: string): boolean {
    // 调用decorateData修饰数据
    const params = this.decorateData(data);
    // 如果是实时上报模式，直接调用sendBeacon上报
    if (this.options.realTime) {
      return sendBeacon(this.options.requestUrl, params);
    } else {
      // 将数据存入report属性中对应key的数组中
      !this.report.hasOwnProperty(key) && (this.report[key] = []);
      this.report[key].push(params);
      // 不是实时上报模式，先判断是否超过最大值，超过则上报
      const size =
        this.stringSizeCalculation &&
        this.stringSizeCalculation(JSON.stringify(this.report));
      log && log(size, params); // 打印上报数据,方便调试
      // 判断是否超过最大值，已经超过了则上报
      if (
        this.options.maxSize &&
        size &&
        size > (this.options.maxSize || 10000)
      ) {
        // 调用累积上报方法
        this.sendReport();
      }
      return true;
    }
  }
  // 启动页面关闭前上报
  private beforeCloseReport() {
    // 设置beforeCloseHandler
    this.beforeCloseHandler = () => {
      this.sendReport();
    };
    // 监听页面关闭前beforeunload事件
    window.addEventListener("beforeunload", this.beforeCloseHandler);
  }

  // 允许外部设置uuid
  public setUserID<T extends DefaultOptions["uuid"]>(uuid: T) {
    if (this.isDestroy) return;
    this.options.uuid = uuid;
  }
  // 外部设置额外参数
  public setExtra<T extends DefaultOptions["extra"]>(extra: T) {
    if (this.isDestroy) return;
    this.options.extra = extra;
  }

  // 主动上报
  public sendTracker<T>(targetKey: string = "manual", data?: T) {
    if (this.isDestroy) return;
    this.reportTracker(
      {
        event: "manual",
        targetKey,
        data,
      },
      "manual"
    );
  }
  // 累积数据上报方法
  // 这是一个公共方法，允许外部调用，用户可以在合适的时候上报数据，而不用等数据累积超过最大值
  public sendReport(): boolean {
    // 如果已经销毁，直接返回
    if (this.isDestroy) return false;
    // 调用sendBeacon上报数据
    const state = sendBeacon(this.options.requestUrl, this.report);
    // 上报成功后清空report
    state && (this.report = {});
    // 返回上报状态
    return state;
  }
  // 销毁
  public destroy() {
    // 如果已经销毁，直接返回
    if (this.isDestroy) return;
    // 销毁前把剩余数据传出
    this.sendReport();
    // 遍历所有监控类
    for (const key in this.trackers) {
      // 调用其销毁方法
      this.trackers[key as keyof Trackers]?.destroy();
      // 将其实例置为undefined，以便GC回收
      this.trackers[key as keyof Trackers] = undefined;
    }
    // 移除beforeCloseHandler
    this.beforeCloseHandler &&
      window.removeEventListener("beforeunload", this.beforeCloseHandler);
    // 设置属性为undefined，以便GC回收
    this.stringSizeCalculation = undefined;
    this.beforeCloseHandler = undefined;
    // 将销毁标志置为true
    this.isDestroy = true;
  }
}
