export function sendBeacon(url: string, params: object): boolean {
  if (Object.keys(params).length <= 0) {
    return false;
  }
  const blob = new Blob([JSON.stringify(params)], {
    type: 'application/x-www-form-urlencoded'
  });
  const state = navigator.sendBeacon(url, blob);
  return state;
}