import { InitiatorTypeLiteral } from "../types"

// 获取dom加载性能指标
export function getDomPerformance(accuracy: number = 2): object | null {
  // 获取导航计时
  const navigationTiming = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming || performance.timing;
  // 获取首次渲染计时
  const firstPaintTiming = window.performance.getEntriesByType('paint')[0];
  // 获取首次内容渲染计时
  const firstContentfulPaintTiming = window.performance.getEntriesByType('paint')[1];
  if (!navigationTiming) return null;
  // 浏览器与服务器开始SSL安全链接的握手时间
  const sslTime = navigationTiming.secureConnectionStart;
  return {
    // 页面加载开始时间
    startTime: navigationTiming.startTime.toFixed(accuracy),
    // 页面加载总耗时
    duration: (navigationTiming.duration).toFixed(accuracy),
    // DNS查询耗时
    DNS: (navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart).toFixed(accuracy),
    // TCP连接耗时
    TCP: (navigationTiming.connectEnd - navigationTiming.connectStart).toFixed(accuracy),
    // SSL连接耗时
    SSL: (sslTime > 0 ? navigationTiming.connectEnd - sslTime : 0).toFixed(accuracy),
    // 首字节时间，即服务器响应时间
    TTFB: (navigationTiming.responseStart - navigationTiming.requestStart).toFixed(accuracy),
    // 白屏时间，首屏绘制
    FP: (firstPaintTiming ? firstPaintTiming.startTime - navigationTiming.fetchStart : navigationTiming.responseEnd - navigationTiming.fetchStart).toFixed(accuracy),
    // 首次内容渲染时间
    FCP: (firstContentfulPaintTiming ? firstContentfulPaintTiming.startTime - navigationTiming.fetchStart : 0).toFixed(accuracy),
    // 首次可交互时间
    TTI: (navigationTiming.domInteractive - navigationTiming.startTime).toFixed(accuracy),
    // 页面重定向耗时
    redirect: (navigationTiming.redirectEnd - navigationTiming.redirectStart).toFixed(accuracy),
    // 重定向次数
    redirectCount: navigationTiming.redirectCount,
    // 前一个页面卸载耗时
    unload: (navigationTiming.unloadEventEnd - navigationTiming.unloadEventStart).toFixed(accuracy),
    // HTML 加载完成时间
    ready: (navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime).toFixed(accuracy),
    // 页面加载总耗时，此时触发完成了onload事件
    load: (navigationTiming.loadEventEnd - navigationTiming.startTime).toFixed(accuracy),
    // DOM解析耗时，页面请求完成后，到整个DOM解析完所用的时间
    dom: (navigationTiming.domContentLoadedEventEnd - navigationTiming.responseEnd).toFixed(accuracy),
    // html文档完全解析完毕的时间节点
    domComplete: navigationTiming.domComplete.toFixed(accuracy),
    // 资源加载耗时
    resource: (navigationTiming.domComplete - navigationTiming.domInteractive).toFixed(accuracy),
    // HTML加载完时间，指页面所有 HTML 加载完成（不包括页面渲染时间）
    htmlLoad: (navigationTiming.responseEnd - navigationTiming.startTime).toFixed(accuracy),
    // DOMContentLoaded 事件耗时
    DCL: (navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart).toFixed(accuracy),
    // onload事件耗时
    onload: (navigationTiming.loadEventEnd - navigationTiming.loadEventStart).toFixed(accuracy),
  }
}

// 获取首屏已经加载完毕的资源的性能信息
export function getResourcePerformance(accuracy: number = 2): InitiatorTypeLiteral | null {
  if (!window.performance) return null;
  // 获取 PerformanceResourceTiming 数组
  const data = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  // 保存资源分类
  const resources: InitiatorTypeLiteral = {}
  data.forEach(i => {
    let key = i.initiatorType || 'other';
    if (key === 'beacon') return; // 跳过beacon上报请求
    if (key === 'other') {
      const extension = urlHandle(i.name, 2)
      switch (extension) {
        case 'css': key = 'css'; break;
        case 'js': key = 'js'; break;
        case 'json': key = 'json'; break;
        case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': key = 'img'; break;
        default: break;
      }
    }
    !resources.hasOwnProperty(key) && (resources[key] = [])
    resources[key].push({
      name: i.name, // 资源的名称
      duration: i.duration.toFixed(accuracy), // 资源加载耗时
      type: i.entryType, // 资源类型
      initiatorType: i.initiatorType, // 发起资源请求的类型（标签名）
      size: i.decodedBodySize || i.transferSize, // 资源大小
    })
  })
  return resources;
}

// 监听资源加载
export function listenResourceLoad(callback: (arg0: PerformanceResourceTiming) => void): PerformanceObserver {
  // 创建一个PerformanceObserver性能观察者实例
  const observer = new PerformanceObserver((list, _observer) => {
    // 因为只观察了resource，可以将 PerformanceEntryList 作为 PerformanceResourceTiming[] 类型进行遍历
    (list.getEntries() as PerformanceResourceTiming[]).forEach((e) => {
      // 如果不是beacon请求，就执行回调
      if (e.initiatorType !== "beacon") {
        callback(e);
      }
    });
  });
  // 开始观察entryTypes为resource的性能条目，也就是资源加载性能
  observer.observe({
    entryTypes: ["resource"],
  });
  // 返回观察者实例
  return observer;
}

// 获取url中需要的数据  type  1: 获取文件名  2：获取后缀  3：获取文件名+后缀  4:获取文件前缀
function urlHandle(url: string, type: number): string | undefined {
  let filename = url.substring(url.lastIndexOf('/') + 1)
  switch (type) {
    case 1: return filename; break;
    case 2: return filename.substring(filename.lastIndexOf(".") + 1); break;
    case 3: return filename.substring(0, filename.lastIndexOf(".")); break;
    case 4: return url.substring(0, url.lastIndexOf('/') + 1); break;
    default: return undefined;
  }
}