import { Options, EventListeners } from "../../types";

export abstract class TrackerCls {
  protected options: Options
  protected reportTracker: Function // 上报数据的方法
  protected eventListeners: EventListeners = {}

  constructor(options: Options, reportTracker: Function) {
    this.options = options;
    this.reportTracker = reportTracker;
  }
  abstract init(): void
  // 封装addEventListener
  protected addEventListener(name: string, handler: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false) {
    !this.eventListeners.hasOwnProperty(name) && (this.eventListeners[name] = [])
    this.eventListeners[name].push(handler)
    window.addEventListener(name, handler, options)
  }
  // 销毁
  public destroy() {
    for (const eventName in this.eventListeners) {
      const listeners = this.eventListeners[eventName];
      for (const listener of listeners) {
        window.removeEventListener(eventName, listener);
      }
    }
    this.eventListeners = {};
  }
}