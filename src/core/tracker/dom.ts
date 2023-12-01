import { Options } from "../../types";
import TrackerCls from "./trackerCls";

export default class DomTracker extends TrackerCls {

  constructor(options: Options, reportTracker: Function) {
    super(options, reportTracker);
    this.options = options;
    this.reportTracker = reportTracker;
  }
  public init() {
    if (this.options.domTracker) {
      this.domEventReport()
    }
  }
  additionalDestroy() { }
  // 监听dom事件，并上报相关数据
  private domEventReport() {
    this.options.domEventsList?.forEach(event => {
      const eventHandler: EventListenerOrEventListenerObject = (e) => {
        const target = e.target as HTMLElement;
        // 设置target-events属性，元素层次限制上报的事件
        const targetEvents = JSON.stringify(target.getAttribute('target-events'));
        if (targetEvents && !targetEvents.includes(e.type)) {
          return;
        }
        // 获取目标key，设置key分辨不同元素
        // <button target-key="btn" target-events="['click']">dom事件上报测试</button>
        const targetKey = target.getAttribute('target-key');
        if (targetKey) {
          // console.log(e);
          this.reportTracker({
            event,
            targetKey,
            // 元素的基本信息，便于定位
            elementInfo: {
              name: target.localName ?? target.nodeName,
              id: target.id,
              classList: Array.from(target.classList),
              // innerText: target.innerText,
            }
          }, 'dom')
        }
      }
      this.addEventListener(event, eventHandler)
    })
  }
}