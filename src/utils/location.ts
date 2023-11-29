// back()、forward() 和 go() 事件都会触发 popState 事件。
// 但是 pushState() 和 replaceEstate() 不会触发 popState 事件。因此我们需要做些代码处理让它们都能触发某一个事件
export const createHistoryEvent = <T extends keyof History>(type: T, eventName: string): () => any => {
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
  window.history['pushState'] = createHistoryEvent("pushState", eventName);
  window.history['replaceState'] = createHistoryEvent("replaceState", eventName);
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event(eventName))
  })
}

export function getLocation(): string {
  return window.location.pathname + window.location.hash
}