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
export function getDomPerformance(): object {
  const performanceData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  return {
    startTime: performanceData.startTime,
    whiteScreen: performance.getEntriesByType('paint')[0].startTime, // 白屏时间
    load: performanceData.loadEventEnd - performanceData.startTime, // 页面加载总耗时，此时触发完成了onload事件
    dom: performanceData.domContentLoadedEventEnd - performanceData.responseEnd, // DOM解析耗时，页面请求完成后，到整个DOM解析完所用的时间
    domComplete: performanceData.domComplete, // html文档完全解析完毕的时间节点
    resource: performanceData.loadEventEnd - performanceData.domContentLoadedEventEnd, // 资源加载耗时
    htmlLoad: performanceData.responseEnd - performanceData.startTime, // HTML加载完时间，指页面所有 HTML 加载完成（不包括页面渲染时间）
    firstInteraction: performanceData.domInteractive - performanceData.startTime, // 首次交互时间
    secureConnectionStart: performanceData.secureConnectionStart, // 浏览器与服务器开始安全链接的握手时间
  }
}

// 获取已经加载完毕的资源的PerformanceResourceTiming
export function getResourcePerformance(): PerformanceEntryList {
  return performance.getEntriesByType("resource");
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

