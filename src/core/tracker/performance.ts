import { Options } from "../../types";
import { TrackerCls } from "./tracker";
import { getDomPerformance, getResourcePerformance, listenResourceLoad } from "../../utils";

export default class PerformanceTracker extends TrackerCls {

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
    this.options = options;
    this.reportTracker = reportTracker;
  }
  public init() {
    if (this.options.performanceTracker) {
      this.performanceReport()
    }
  }
  // 性能监控上报
  private performanceReport(accuracy: number = 2) {
    const eventName = 'load';
    const eventHandler: EventListenerOrEventListenerObject = () => {
      const domPerformance = getDomPerformance(accuracy);
      const resourcePerformance = getResourcePerformance(accuracy);
      const data = {
        targetKey: 'performance',
        event: 'load',
        domPerformance,
        resourcePerformance
      }
      // console.log(data)
      this.reportTracker(data, 'performance');
      // load完后开启资源的持续监控，例如后续请求以及图片的懒加载
      listenResourceLoad((entry) => {
        const data = {
          targetKey: 'resourceLoad',
          event: 'load',
          resource: {
            name: entry.name,
            duration: entry.duration.toFixed(accuracy),
            type: entry.entryType
          }
        }
        // console.log(data)
        this.reportTracker(data, 'performance');
      })
    }
    this.addEventListener(eventName, eventHandler)
  }
}
