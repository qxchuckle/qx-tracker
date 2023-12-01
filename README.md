# Tracker
这是一个前端监控和埋点SDK，你可以简单地使用它，为你的web应用收集数据信息

使用方法：

```js
import Tracker from 'qx-tracker';

const tracker = new Tracker({
  requestUrl: 'http://127.0.0.1:9000/tracker',
});
```

## 配置
你还需要手动启用需要的功能

考虑到需求不同，防止数据混乱，所有监控功能都默认关闭，要按需启用

```ts
/**
 * @uuid 唯一表示用户ID，默认通过canvas指纹生成8位uuid
 * @requestUrl 数据上报API
 * @historyTracker history模式
 * @hashTracker hash模式
 * @errorTracker error事件上报(js、promise等)
 * @domTracker 上报dom事件，需要给被监听元素加上target-key标识
 * @domEventsList 需要监听的dom事件，target-events属性给元素单独指定
 * @performanceTracker 性能监控，页面加载，资源加载等
 * @extra 需要携带的额外数据
 * @sdkVersion sdk版本
 * @log 控制台输出信息，
 * @realTime 是否实时上报
 * @maxSize 报告数据最大缓存量，超过该值则会自动上报
 */
interface DefaultOptions {
  requestUrl: string,
  uuid: string | undefined,
  historyTracker: boolean,
  hashTracker: boolean,
  errorTracker: boolean,
  domTracker: boolean,
  domEventsList: Set<keyof HTMLElementEventMap>,
  performanceTracker: boolean,
  extra: Record<string, any> | undefined,
  sdkVersion: string | number,
  log: boolean,
  realTime: boolean,
  maxSize: number,
}
// 必传项
type Options = Optional<DefaultOptions, 'requestUrl'>
// 默认值
private initDefault(): types.DefaultOptions {
  return <types.DefaultOptions>{
    requestUrl: "",
    uuid: this.generateUserID(),
    historyTracker: false,
    hashTracker: false,
    errorTracker: false,
    domTracker: false,
    domEventsList: new Set(['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseout', 'mouseover']),
    performanceTracker: false,
    extra: undefined,
    sdkVersion: types.TrackerConfig.version,
    log: true,
    realTime: false,
    maxSize: 1024 * 50
  }
}
```

对于dom事件的监听上报，有两个属性细化控制：
1. `target-key` 标识key，启用对该元素的监听
2. `target-events` 该元素需要监听的dom事件，为@domEventsList的子集

```html
<button class="a b c" id="d" target-key="btn" target-events="['click']">dom事件上报测试</button>
<div target-key="div" target-events="['mouseover', 'mouseout']" style="width:100px;height:100px;background-color:blue;"></div>
```

## 数据
上报数据的获取，一个简单的express服务：

```js
const express = require('express');
const app = express();

app.use(express.urlencoded({
  extended: false,
}));

app.post('/tracker', function (req, res) {
  // console.log(req.body);
  console.log(JSON.parse(Object.keys(req.body)[0] + Object.values(req.body)[0]));
  res.send('ok');
});

app.listen(9000, () => {
  console.log('listening on')
})
```

上报数据案例：

```js
// hash模式路由变化及浏览时长
{
  uuid: '6d6a0e19',
  time: 1701161772275,
  location: '/#a',
  event: 'hashchange',
  targetKey: 'hash-pv',
  targetLocation: '/#b',
  duration: 42386
}
// dom事件埋点
{
  uuid: '6d6a0e19',
  time: 1701415010788,
  location: '/',
  event: 'click',
  targetKey: 'btn',
  elementInfo: {
    name: 'button',
    id: 'd',
    class: 'a b c'
  }
}
// jsError上报
{
  uuid: '6d6a0e19',
  time: 1701415148476,
  location: '/',
  targetKey: 'jsError',
  event: 'error',
  info: 'Uncaught Error: This is an error message'
}
// 资源加载失败resourceError上报
{
  uuid: '6d6a0e19',
  time: 1701414974549,
  location: '/',
  targetKey: 'resourceError',
  event: 'error',
  info: {
    name: 'IMG',
    class: 'error_img',
    id: 'error_img',
    url: 'https://aaabbbcccddd123456789.com/index.png'
  }
}
// 首屏性能
{
  uuid: '6d6a0e19',
  time: 1701415366490,
  location: '/',
  targetKey: 'performance',
  event: 'load',
  domPerformance: {
    startTime: '0.00',
    load: '0.00',
    dom: '1852.80',
    domComplete: '2534.80',
    resource: '-1888.50',
    htmlLoad: '35.70',
    firstInteraction: '1887.40',
    secureConnectionStart: '0.00'
  },
  resourcePerformance: {
    script: [ [Object], [Object], [Object] ],
    link: [ [Object] ],
    img: [ [Object], [Object], 
      {
        duration: "931.20",
        initiatorType: "img"name: "https://avatars.githubusercontent.com/u/55614189?v=4",
        size: 0,
        type: "resource",
      }
    ]
  }
}
// 首屏后的请求和资源加载监听
{
  uuid: '6d6a0e19',
  time: 1701415425990,
  location: '/',
  targetKey: 'resourceLoad',
  event: 'load',
  resource: {
    name: 'https://github.githubassets.com/assets/mona-loading-dimmed-5da225352fd7.gif',
    duration: '126.60',
    type: 'resource',
    initiatorType: 'img',
    size: 0 // 请求跨域资源等情况均为0，这个size不保证正确
  }
}
```

非实时统一上报时：

```js
{
  error: [
    {
      uuid: '6d6a0e19',
      time: 1701415598755,
      location: '/',
      targetKey: 'resourceError',
      event: 'error',
      info: [Object]
    },
    {
      uuid: '6d6a0e19',
      time: 1701415608466,
      location: '/',
      targetKey: 'jsError',
      event: 'error',
      info: 'Uncaught Error: This is an error message'
    }
  ],
  performance: [
    {
      uuid: '6d6a0e19',
      time: 1701415598905,
      location: '/',
      targetKey: 'performance',
      event: 'load',
      domPerformance: [Object],
      resourcePerformance: [Object]
    },
    {
      uuid: '6d6a0e19',
      time: 1701415600420,
      location: '/',
      targetKey: 'resourceLoad',
      event: 'load',
      resource: [Object]
    },
    {
      uuid: '6d6a0e19',
      time: 1701415601087,
      location: '/',
      targetKey: 'resourceLoad',
      event: 'load',
      resource: [Object]
    }
  ],
  dom: [
    {
      uuid: '6d6a0e19',
      time: 1701415604311,
      location: '/',
      event: 'click',
      targetKey: 'btn',
      elementInfo: [Object]
    }
  ]
}
```






