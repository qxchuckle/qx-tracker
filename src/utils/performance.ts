import { InitiatorTypeLiteral } from "../types"

// 获取dom加载性能指标
export function getDomPerformance(accuracy: number = 2): object | null {
  const performanceData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!performanceData) return null;
  return {
    startTime: performanceData.startTime.toFixed(accuracy),
    whiteScreen: performance.getEntriesByType('paint')[0]?.startTime.toFixed(accuracy), // 白屏时间
    load: (performanceData.loadEventEnd - performanceData.startTime).toFixed(accuracy), // 页面加载总耗时，此时触发完成了onload事件
    dom: (performanceData.domContentLoadedEventEnd - performanceData.responseEnd).toFixed(accuracy), // DOM解析耗时，页面请求完成后，到整个DOM解析完所用的时间
    domComplete: performanceData.domComplete.toFixed(accuracy), // html文档完全解析完毕的时间节点
    resource: (performanceData.loadEventEnd - performanceData.domContentLoadedEventEnd).toFixed(accuracy), // 资源加载耗时
    htmlLoad: (performanceData.responseEnd - performanceData.startTime).toFixed(accuracy), // HTML加载完时间，指页面所有 HTML 加载完成（不包括页面渲染时间）
    firstInteraction: (performanceData.domInteractive - performanceData.startTime).toFixed(accuracy), // 首次交互时间
    secureConnectionStart: performanceData.secureConnectionStart.toFixed(accuracy), // 浏览器与服务器开始安全链接的握手时间
  }
}

// 获取已经加载完毕的资源的性能信息
export function getResourcePerformance(accuracy: number = 2): InitiatorTypeLiteral | null {
  if (!window.performance) return null;
  const data = window.performance.getEntriesByType('resource')
  // 将资源分类
  const resources: InitiatorTypeLiteral = {}
  data.forEach(item => {
    const i = item as PerformanceResourceTiming;
    let key = i.initiatorType || 'other';
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
      size: i.transferSize.toFixed(accuracy), // 资源大小
      protocol: i.nextHopProtocol, // 资源所用协议
    })
  })
  return resources;
}

// 监听资源加载
export function listenResourceLoad(callback: (arg0: PerformanceEntry) => void) {
  const observer = new PerformanceObserver((list, _observer) => {
    list.getEntries().forEach((entry) => {
      const e = entry as PerformanceResourceTiming;
      if (e.initiatorType !== "beacon") {
        callback(e);
      }
    });
  });
  observer.observe({
    entryTypes: ["resource"],
  });
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