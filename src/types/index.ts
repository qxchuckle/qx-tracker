// 选项
export interface DefaultOptions {
  uuid: string | undefined,
  requestUrl: string | undefined,
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
export type Report = {
  [x in string]: any[]
}
// 用户传入选项
export interface Options extends Partial<DefaultOptions> {
  // 必传项
  requestUrl: string,
}
// 一些设置
export enum TrackerConfig {
  version = '1.0.0', // 版本
}
export type InitiatorTypeLiteral = {
  [K in PerformanceResourceTiming["initiatorType"]]: Array<{
    name: string;
    duration: string | number, // 资源加载耗时
    size: string | number, // 资源大小
    protocol: string, // 资源所用协议
  }>;
};

export type EventListeners = {
  [eventName: string]: Array<EventListenerOrEventListenerObject>;
};