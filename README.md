# Tracker
这是一个埋点SDK，你可以简单地使用它，为你的web应用收集数据信息

使用方法：

```js
import Tracker from 'qx-tracker';

const tracker = new Tracker({
  requestUrl: 'http://127.0.0.1:9000/tracker',
});
```

## 配置
你还需要手动启用需要上报的数据：

```ts
/**
 * @uuid 唯一表示用户ID
 * @requestUrl 数据上报API
 * @historyTracker history模式
 * @hashTracker hash模式
 * @errorTracker error事件上报(js、promise等)
 * @domTracker 上报dom事件，需要给被监听元素加上target-key标识
 * @domEventsList 需要监听的dom事件，target-events属性给元素单独指定
 * @extra 需要携带的额外数据
 * @sdkVersion sdk版本
 * @log 控制台输出信息
 */
interface DefaultOptions {
  uuid: string | undefined;
  requestUrl: string | undefined;
  historyTracker: boolean;
  hashTracker: boolean;
  errorTracker: boolean;
  domTracker: boolean;
  domEventsList: Array<keyof HTMLElementEventMap>;
  extra: Record<string, any> | undefined;
  sdkVersion: string | number;
  log: boolean;
}
interface Options extends Partial<DefaultOptions> {
  requestUrl: string;
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
  console.log(req.body);
  console.log(JSON.parse(Object.keys(req.body)[0]));
  res.send('ok');
});

app.listen(9000, () => {
  console.log('listening on')
})
```

上报数据案例：

```js
// hash模式监听路由变化及浏览时长
{
  uuid: '6d6a0e19',
  time: 1701161772275,
  location: '/#a',
  event: 'hashchange',
  targetKey: 'hash-pv',
  targetLocation: '/#b',
  duration: 42386
}
// dom事件
{
  uuid: '6d6a0e19',
  time: 1701161859822,
  location: '/#adsd23',
  event: 'click',
  targetKey: 'btn',
  elementInfo: {
    name: 'button',
    id: 'd',
    classList: [ 'a', 'b', 'c' ],
    innerText: 'dom事件上报测试'
  }
}
// error监听上报
{
  uuid: '6d6a0e19',
  time: 1701161928556,
  location: '/#adsd23',
  targetKey: 'message',
  event: 'error',
  message: 'Uncaught ReferenceError: abc is not defined'
}
```



