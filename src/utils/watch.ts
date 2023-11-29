
// 监视器
type watchCallback = (target?: object) => void
export const watch = <T extends object>(obj: T, callback: watchCallback, options = { deep: true }): T => {
  return options.deep ? deepProxy(obj, callback, obj) : proxy(obj, callback, obj);
};
function deepProxy(value: any, callback: watchCallback, topLayer?: object) {
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        value[i] = deepProxy(v, callback, topLayer)
      })
    } else {
      Object.keys(value).forEach(v => {
        value[v] = deepProxy(value[v], callback, topLayer)
      });
    }
    return proxy(value, callback, topLayer);
  }
  return value;
}
function proxy(obj: object, callback: watchCallback, topLayer?: object) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver): any {
      let newValue = deepProxy(value, callback, topLayer)
      callback(topLayer); // 始终对最顶层对象进行操作
      return Reflect.set(target, key, newValue, receiver);
    }
  });
};