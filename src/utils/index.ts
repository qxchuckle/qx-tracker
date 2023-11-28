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

