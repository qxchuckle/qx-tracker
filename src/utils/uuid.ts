// 字符串生成8位hash值
function generateHash(str: string): string {
  // 使用 atob 函数将 Base64 编码的图像数据解码为二进制字符串。
  str = atob(str);
  let hash = 0;
  // 遍历字符串
  for (let i = 0; i < str.length; i++) {
    // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
    // << 5 位运算符，将二进制数据后向左移动5位，相当于乘以2的5次方
    // 目的是提高 hash 的复杂度
    hash = (hash << 5) - hash + str.charCodeAt(i);
    // 当JS进行位运算时，它会将操作数视为 32 位整数，忽略其它位。
    hash |= 0;
  }
  // 一个32位整数的十六进制位8位，所以就生成了一个8位的hash值
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// 通过canvas获取浏览器指纹ID
export function getCanvasID(str: string = '#qx.chuckle,123456789<canvas>'): string | undefined {
  const canvas = document.createElement('canvas'); // 创建一个 canvas 元素
  const ctx = canvas.getContext("2d"); // 获取 canvas 的 2D 渲染上下文
  if (!ctx) {
    return undefined;
  }
  ctx.font = "14px 'Arial'"; // 设置字体
  ctx.textBaseline = "bottom"; // 设置基线
  ctx.fillStyle = "#f60"; // 设置填充颜色
  // 在 canvas 上绘制一个橙色的矩形，矩形的左上角坐标为 (125, 1)，宽度为 62 像素，高度为 20 像素。
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069"; // 设置填充颜色
  // 在坐标 (2, 15) 的位置绘制深蓝色的文本，文本内容为 str。
  ctx.fillText(str, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)"; // 设置填充颜色
  // 在坐标 (4, 17) 的位置绘制半透明绿色的文本，文本内容为 str。
  ctx.fillText(str, 4, 17);
  // toDataURL将canvas转换为dataUrl也就是base64编码的图像数据，并去掉前缀保留数据部分
  const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
  return generateHash(b64);
}