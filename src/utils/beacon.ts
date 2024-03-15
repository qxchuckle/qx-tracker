// 封装sendBeacon，传入url和params，返回上报状态
export function sendBeacon(url: string, params: object): boolean {
  // 判断是否有数据，也就是params是否为空对象
  if (Object.keys(params).length <= 0) {
    return false;
  }
  // const blob = new Blob([JSON.stringify(params)], {
  //   type: 'application/json'
  // });
  const state = navigator.sendBeacon(url, JSON.stringify(params));
  return state;
}