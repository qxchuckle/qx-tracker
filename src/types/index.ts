import { LocationTracker, DomTracker, ErrorTracker, PerformanceTracker, NavigatorTracker } from "../core/tracker";

/**
 * 选项生成器
 * @param T - 原始类型
 * @param K - 必填类型
 */
type Optional<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// 选项
export interface DefaultOptions {
  requestUrl: string, // 上报地址
  uuid: string | undefined, // 用户唯一标识
  historyTracker: boolean, // history模式，开启后会监听路由变化
  hashTracker: boolean, // hash模式，开启后会监听路由变化
  errorTracker: boolean, // 错误监控
  domTracker: boolean, // dom埋点监控
  domEventsList: Set<keyof HTMLElementEventMap>, // 需要监控的dom事件
  performanceTracker: boolean, // 性能监控
  navigatorTracker: boolean, // 用户信息监控
  extra: Record<string, any> | undefined, // 上报时需要携带的额外信息
  sdkVersion: string | number, // sdk版本
  log: boolean, // 是否在控制台打印日志
  realTime: boolean, // 是否实时上报
  maxSize: number, // 单次上报数据最大值，单位字节
}

// 用户传入选项
export type Options = Optional<DefaultOptions, 'requestUrl'>

export type Report = {
  [x in string]: any[]
}
// 一些设置
export enum TrackerConfig {
  version = '1.0.0', // 版本
}
export type Resource = {
  // PerformanceResourceTiming不再能获取资源大小
  name: string; // 资源名称，通常为url
  duration: string | number, // 资源加载耗时
  type: string, // 资源类型
  initiatorType: string, // 发起资源请求的类型（标签名、请求方式等）
  size?: string | number, // 资源大小
}
export type InitiatorTypeLiteral = {
  [K in PerformanceResourceTiming["initiatorType"]]: Array<Resource>;
};

export type EventListeners = {
  [eventName: string]: Array<EventListenerOrEventListenerObject>;
};

export type Trackers = {
  locationTracker: LocationTracker | undefined,
  domTracker: DomTracker | undefined,
  errorTracker: ErrorTracker | undefined,
  performanceTracker: PerformanceTracker | undefined,
  navigatorTracker: NavigatorTracker | undefined,
}