import { Options } from "../../types";

export default class ErrorTracker {
  protected options: Options
  private reportTracker: Function // 上报数据的方法

  constructor(options: Options, reportTracker: Function) {
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
    window.addEventListener('error', (e) => {
      this.reportTracker({
        targetKey: 'message',
        event: 'error',
        message: e.message
      }, 'error')
    }, true)
  }
  //捕获promise 错误
  private promiseReject() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch(error => {
        this.reportTracker({
          targetKey: "reject",
          event: "promise",
          message: error
        }, 'error')
      })
    })
  }
}