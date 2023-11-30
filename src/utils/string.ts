export function createStringSizeCalculation() {
  const textEncode = new TextEncoder();
  return function (str: string) {
    return textEncode.encode(str).length;
  }
}