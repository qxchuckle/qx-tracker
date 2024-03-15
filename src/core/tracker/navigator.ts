import { Options } from "../../types";
import TrackerCls from "./trackerCls";
import { getNavigatorInfo } from "../../utils";

export default class NavigatorTracker extends TrackerCls {
  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
  }
  // 初始化
  public init() {
    if (this.options.navigatorTracker) {
      this.navigatorReport()
    }
  }
  additionalDestroy() { }
  // 用户信息上报
  private navigatorReport() {
    this.reportTracker({
      targetKey: 'navigator',
      event: null,
      info: getNavigatorInfo(),
    }, 'navigator')
  }
}


