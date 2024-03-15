import { Options } from "../../types";
import TrackerCls from "./trackerCls";

export default class ErrorTracker extends TrackerCls {

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
  }
  // 初始化
  public init() {
    if (this.options.errorTracker) {
      this.errorReport()
    }
  }
  additionalDestroy() { }
  // 启用错误上报
  private errorReport() {
    this.errorEvent()
    this.promiseReject()
  }
  // 监听error事件，并上报相关数据
  private errorEvent() {
    const eventName = 'error';
    // 回调
    const eventHandler: EventListenerOrEventListenerObject = (e) => {
      const [info, targetKey] = this.analyzeError(e)
      this.reportTracker({
        targetKey: targetKey,
        event: 'error',
        info: info
      }, 'error')
    }
    // 错误事件不会冒泡，需在捕获阶段监听
    this.addEventListener(eventName, eventHandler, true)
  }
  // 解析错误信息,区分js错误和资源加载错误,返回错误信息和错误分类
  private analyzeError(event: Event): [object | string, string] {
    const target = event.target || event.srcElement;
    // 如果是dom元素,说明是资源加载错误
    if (target instanceof HTMLElement) {
      return [{
        name: target.tagName || target.localName || target.nodeName,
        class: target.className || null,
        id: target.id || null,
        url: (target as any).src || (target as any).href || null,
      }, "resourceError"]
    }
    // 如果event是ErrorEvent类型,说明是js错误
    if (event instanceof ErrorEvent) {
      return [event.message, "jsError"];
    }
    // 兜底返回
    return [event, "otherError"];
  }
  // 监控未捕获的Promise Reject，可以认为是Promise错误
  private promiseReject() {
    const eventName = 'unhandledrejection';
    // 回调
    const eventHandler: EventListenerOrEventListenerObject = (event) => {
      (event as PromiseRejectionEvent).promise.catch(error => {
        this.reportTracker({
          targetKey: "reject",
          event: "promise",
          info: error
        }, 'error')
      })
    }
    this.addEventListener(eventName, eventHandler)
  }
}