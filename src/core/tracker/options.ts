import { DefaultOptions, Options, TrackerConfig } from "../../types"; // 导入类型
import { getCanvasID } from "../../utils"; // 导入通过canvas获取uuid的方法

export default class TrackerOptions {
  // 存储配置项，protected权限，实例不能访问，子类和自己可以访问
  protected options: Options
  
  // 构造函数，接收配置项
  constructor(options: Options) {
    // 合并默认和用户传入设置，用户传入设置优先级高
    // 通过 Object.assign 合并默认配置和用户配置
    this.options = Object.assign(this.initDefault(), options);
  }
  // 初始化配置项
  private initDefault(): DefaultOptions {
    return <DefaultOptions>{
      requestUrl: "", // 上报地址
      uuid: this.generateUserID(), // 用户唯一标识
      historyTracker: false, // history模式，开启后会监听路由变化
      hashTracker: false, // hash模式，开启后会监听路由变化
      errorTracker: false, // 错误监控
      domTracker: false, // dom埋点监控
      // 需要监控的dom事件
      domEventsList: new Set(['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover']),
      performanceTracker: false, // 性能监控
      navigatorTracker: false, // 用户信息监控
      extra: undefined, // 上报时需要携带的额外信息
      sdkVersion: TrackerConfig.version, // sdk版本
      log: true, // 是否在控制台打印日志
      realTime: false, // 是否实时上报
      maxSize: 1024 * 50 // 单次上报数据最大值，单位字节
    }
  }
  // 生成uuid
  public generateUserID(): string | undefined {
    return getCanvasID()
  }
}
