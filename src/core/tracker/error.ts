import { Options } from "../../types";
import TrackerCls from "./trackerCls";

export default class ErrorTracker extends TrackerCls {

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
    this.options = options;
    this.reportTracker = reportTracker;
  }
  public init() {
    if (this.options.errorTracker) {
      this.errorReport()
    }
  }
  additionalDestroy() { }
  private errorReport() {
    this.errorEvent()
    this.promiseReject()
  }
  //捕获报错
  private errorEvent() {
    const eventName = 'error';
    const eventHandler: EventListenerOrEventListenerObject = (e) => {
      const [info, targetKey] = this.analyzeError(e)
      this.reportTracker({
        targetKey: targetKey,
        event: 'error',
        info: info
      }, 'error')
    }
    this.addEventListener(eventName, eventHandler, true)
  }
  private analyzeError(event: Event): [object | string, string] {
    const target = event.target || event.srcElement;
    // 判断是否是link、script等元素节点，区分JS错误和资源加载错误
    if (target instanceof HTMLElement) {
      return [{
        name: target.tagName || target.localName || target.nodeName,
        class: target.className || null,
        id: target.id || null,
        url: (target as any).src || (target as any).href || null,
      }, "resourceError"]
    }
    if (event instanceof ErrorEvent) {
      return [event.message, "jsError"];
    }
    return [event, "otherError"];
  }
  //捕获promise错误
  private promiseReject() {
    const eventName = 'unhandledrejection';
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