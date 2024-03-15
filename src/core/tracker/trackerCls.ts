import { Options, EventListeners } from "../../types";

// 抽象类，具体的监控类需要继承该类，控制监控类的行为
export default abstract class TrackerCls {
  // 存储配置项
  protected options: Options;
  // 存储上报数据的方法
  protected reportTracker: Function; // 上报数据的方法
  // 存储事件监听器
  protected eventListeners: EventListeners = {};

  constructor(options: Options, reportTracker: Function) {
    // 配置项和上报方法由外部传入
    this.options = options;
    this.reportTracker = reportTracker;
  }
  // 抽象方法，如何初始化交给具体的监控类去实现。
  abstract init(): void;
  // 封装addEventListener
  protected addEventListener(
    name: string,
    handler: EventListenerOrEventListenerObject,
    options: boolean | AddEventListenerOptions = false
  ) {
    // 如果没有该事件的监听数组，就初始化一个空的
    !this.eventListeners.hasOwnProperty(name) &&
      (this.eventListeners[name] = []);
    // 将事件监听器存入数组
    this.eventListeners[name].push(handler);
    // 添加事件监听
    window.addEventListener(name, handler, options);
  }
  // 额外需要销毁的内容，由具体的监控类去实现
  abstract additionalDestroy(): void;
  // 销毁方法，因为有事件监听器，所以需要销毁事件监听器，避免内存泄漏
  public destroy() {
    // 遍历eventListeners获取所有事件监听器，然后移除
    for (const eventName in this.eventListeners) {
      const listeners = this.eventListeners[eventName];
      for (const listener of listeners) {
        window.removeEventListener(eventName, listener);
      }
    }
    // 清空eventListeners
    this.eventListeners = {};
    // 调用额外销毁的方法
    this.additionalDestroy();
  }
}
