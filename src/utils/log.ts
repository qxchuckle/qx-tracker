export function createLog() {
  if (__env__ === 'production') return;
  return function log(...args: any) {
    console.log(...args)
  }
}
export const log = createLog()