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