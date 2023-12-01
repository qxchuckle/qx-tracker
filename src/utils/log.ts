export function createLog() {
  if (__env__ === 'production') return null;
  return function log(...args: any) {
    console.log(...args)
  }
}
export const log = createLog()