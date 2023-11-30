import { Options } from "../../types";
import { TrackerCls } from "./tracker";

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
  private errorReport() {
    this.errorEvent()
    this.promiseReject()
  }
  //捕获报错
  private errorEvent() {
    const eventName = 'error';
    const eventHandler: EventListenerOrEventListenerObject = (e) => {
      this.reportTracker({
        targetKey: 'message',
        event: 'error',
        message: (e as ErrorEvent).message
      }, 'error')
    }
    this.addEventListener(eventName, eventHandler)
  }
  //捕获promise 错误
  private promiseReject() {
    const eventName = 'unhandledrejection';
    const eventHandler: EventListenerOrEventListenerObject = (event) => {
      (event as PromiseRejectionEvent).promise.catch(error => {
        this.reportTracker({
          targetKey: "reject",
          event: "promise",
          message: error
        }, 'error')
      })
    }
    this.addEventListener(eventName, eventHandler)
  }
}