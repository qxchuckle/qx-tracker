import { InitiatorTypeLiteral } from "../types"

// back()、forward() 和 go() 事件都会触发 popState 事件。
// 但是 pushState() 和 replaceEstate() 不会触发 popState 事件。因此我们需要做些代码处理让它们都能触发某一个事件
export const createHistoryEvnent = <T extends keyof History>(type: T, eventName: string): () => any => {
  const origin = history[type];
  return function (this: any) {
    const res = origin.apply(this, arguments)
    window.dispatchEvent(new Event(type))
    window.dispatchEvent(new Event(eventName))
    return res;
  }
}
/**
 * 创建对history的监听，统一触发指定自定义事件。
 * @param {string} [eventName='historyChange'] history变化统一触发的自定义事件名。
 * @example
 * window.addEventListener('historyChange', () => {
 *  console.log('history changed!')
 * })
 */
export function createHistoryMonitoring(eventName: string = 'historyChange') {
  window.history['pushState'] = createHistoryEvnent("pushState", eventName);
  window.history['replaceState'] = createHistoryEvnent("replaceState", eventName);
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event(eventName))
  })
}

export function getLocation(): string {
  return window.location.pathname + window.location.hash
}

// 字符串生成8位hash值
function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

// 通过canvas获取浏览器指纹ID
export function getCanvasID(str: string = '#qx.chuckle,123456789<canvas>'): string | undefined {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return undefined;
  }
  var txt = str;
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 17);
  const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
  return generateHash(atob(b64));
}

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
      size: i.transferSize, // 资源大小
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

// 监视器
export const watch = <T extends object>(params: T, fn: (target: T, p: string | symbol, newValue: any, receiver: any) => {}): T => {
  return new Proxy(params, {
    get(target, key, receiver): any {
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver): boolean {
      // 监视的值发生改变后执行传入的函数
      fn(target, key, value, receiver);
      const result = Reflect.set(target, key, value, receiver);
      return result;
    }
  })
};

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