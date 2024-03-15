// back()、forward() 和 go() 事件都会触发 popState 事件。
// 但是 pushState() 和 replaceEstate() 不会触发 popState 事件。因此我们需要做些代码处理让它们都能触发某一个事件
export const createHistoryEvent = <T extends keyof History>(
  type: T,
  eventName: string
): (() => any) => {
  const origin = history[type]; // 保存原始方法
  const e = new Event(eventName); // 创建自定义事件
  const typeEvent = new Event(type); // 创建方法同名事件
  return function (this: any) {
    // 调用原始方法
    const res = origin.apply(this, arguments);
    // 触发自定义事件
    window.dispatchEvent(typeEvent);
    window.dispatchEvent(e);
    return res;
  };
};
/**
 * 创建对history的监听，统一触发指定自定义事件。
 * @param {string} [eventName='historyChange'] history变化统一触发的自定义事件名。
 * @example
 * window.addEventListener('historyChange', () => {
 *  console.log('history changed!')
 * })
 */
export function createHistoryMonitoring(eventName: string = "historyChange") {
  // 重写history的pushState方法
  window.history["pushState"] = createHistoryEvent("pushState", eventName);
  // 重写history的replaceState方法
  window.history["replaceState"] = createHistoryEvent(
    "replaceState",
    eventName
  );
  // 在触发popstate事件时，触发自定义事件
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event(eventName));
  });
}

// 获取当前页面的路径
export function getLocation(): string {
  return window.location.pathname + window.location.hash;
}
