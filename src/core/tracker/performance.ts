import { Options, Resource } from "../../types";
import TrackerCls from "./trackerCls";
import {
  getDomPerformance,
  getResourcePerformance,
  listenResourceLoad,
} from "../../utils";

export default class PerformanceTracker extends TrackerCls {
  // 保存PerformanceObserver性能监控观察者实例。
  private performanceObserver: PerformanceObserver | undefined = undefined;

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
  }
  // 初始化
  public init() {
    if (this.options.performanceTracker) {
      this.performanceReport();
    }
  }
  // 开启性能监控上报
  private performanceReport(accuracy: number = 2) {
    const eventName = "load";
    const performance = () => {
      // 页面加载完后上报dom性能数据
      const domPerformance = getDomPerformance(accuracy);
      // 页面加载完后上报已加载完毕的资源性能数据
      const resourcePerformance = getResourcePerformance(accuracy);
      // 上报的数据
      const data = {
        targetKey: "performance",
        event: "load",
        domPerformance,
        resourcePerformance,
      };
      // 上报数据，类型key为performance
      this.reportTracker(data, "performance");

      // load完后开启资源的持续监控，例如后续请求以及图片的懒加载
      this.performanceObserver = listenResourceLoad(
        (entry: PerformanceResourceTiming) => {
          const resource: Resource = {
            name: entry.name, // 资源名称，通常为url
            duration: entry.duration.toFixed(accuracy), // 资源加载耗时
            type: entry.entryType, // 资源类型
            initiatorType: entry.initiatorType, // 发起资源请求的类型（标签名、请求方式等）
            size: entry.decodedBodySize || entry.transferSize, // 资源大小
          };
          const data = {
            targetKey: "resourceLoad",
            event: "load",
            resource,
          };
          // 上报数据，类型key为performance
          this.reportTracker(data, "performance");
        }
      );
    };
    const eventHandler: EventListenerOrEventListenerObject = () => {
      // 将性能监控函数放到微/宏任务队列中执行，保证在load事件彻底完成之后执行
      if (typeof Promise === 'function'){
        Promise.resolve().then(()=>{
          setTimeout(performance, 0);
        });
      } else {
        setTimeout(performance, 0);
      }
    }
    // 监听load事件
    this.addEventListener(eventName, eventHandler);
  }
  // 销毁时额外需要销毁的内容
  additionalDestroy() {
    // 断开资源监控
    this.performanceObserver?.disconnect();
  }
}
