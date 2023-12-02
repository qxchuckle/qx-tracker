export function getNavigatorInfo(): object {
  const navigator = window.navigator;
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    cookieEnabled: navigator.cookieEnabled,
    language: navigator.language,
    browser: getBrowser(ua),
    os: getOS(ua),
    isMobile: isMobile(ua),
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    }
  }
}

export function getBrowser(ua: string) {
  ua = ua.toLowerCase();
  const browserRegex = {
    Edge: /edge\/([\d.]+)/i,
    IE: /(rv:|msie\s+)([\d.]+)/i,
    Firefox: /firefox\/([\d.]+)/i,
    Chrome: /chrome\/([\d.]+)/i,
    Opera: /opera\/([\d.]+)/i,
    Safari: /version\/([\d.]+).*safari/i
  };
  for (const browser in browserRegex) {
    const match = ua.match(browserRegex[browser as keyof typeof browserRegex]);
    if (match) {
      return { name: browser, version: match[1] };
    }
  }
  return { name: "", version: "0" };
}


export function getOS(ua: string) {
  ua = ua.toLowerCase();
  const osRegex = [
    { name: "windows", regex: /compatible|windows/i },
    { name: "macOS", regex: /macintosh|macintel/i },
    { name: "iOS", regex: /iphone|ipad/i },
    { name: "android", regex: /android/i },
    { name: "linux", regex: /linux/i }
  ];
  for (const os of osRegex) {
    if (ua.match(os.regex)) {
      return os.name;
    }
  }
  return "other";
}

export function isMobile(ua: string) {
  return !!ua.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );;
}

