/**
 * 选项生成器
 * @param T - 原始类型
 * @param K - 必填类型
 */
type Optional<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>; 

// 选项
export interface DefaultOptions {
  requestUrl: string,
  uuid: string | undefined,
  historyTracker: boolean,
  hashTracker: boolean,
  errorTracker: boolean,
  domTracker: boolean,
  domEventsList: Set<keyof HTMLElementEventMap>,
  performanceTracker: boolean,
  extra: Record<string, any> | undefined,
  sdkVersion: string | number,
  log: boolean,
  realTime: boolean,
  maxSize: number,
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
  name: string;
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