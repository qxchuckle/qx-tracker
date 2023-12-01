import { DefaultOptions, Options, TrackerConfig } from "../../types";
import { getCanvasID } from "../../utils";

export default class TrackerOptions {
  protected options: Options
  
  constructor(options: Options) {
    // 合并默认和用户传入设置，用户传入设置优先级高
    this.options = Object.assign(this.initDefault(), options);
  }
  // 初始化配置项
  private initDefault(): DefaultOptions {
    return <DefaultOptions>{
      uuid: this.generateUserID(),
      requestUrl: "",
      historyTracker: false,
      hashTracker: false,
      errorTracker: false,
      domTracker: false,
      domEventsList: new Set(['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover']),
      performanceTracker: false,
      extra: undefined,
      sdkVersion: TrackerConfig.version,
      log: true,
      realTime: false,
      maxSize: 1024 * 50
    }
  }
  // 生成uuid
  public generateUserID(): string | undefined {
    return getCanvasID()
  }
}
