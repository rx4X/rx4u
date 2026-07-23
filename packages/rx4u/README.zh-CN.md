# rx4u

一个轻量级的响应式数据流处理库，提供简洁的函数式编程 API。

## ✨ 特性

- 🚀 **轻量级**：零依赖，体积小巧
- 🔧 **简洁 API**：直观的函数式编程接口
- 📦 **Tree Shaking**：完全支持 ES6 模块和 Tree Shaking
- 🌐 **多环境支持**：支持 ESM、CommonJS 和 CDN 直接引用
- 💪 **TypeScript**：完整的 TypeScript 类型支持
- ⚡ **高性能**：优化的响应式数据流处理

## 📦 安装

```bash
# npm
npm install rx4u

# yarn
yarn add rx4u

# pnpm
pnpm add rx4u
```

## 🚀 快速开始

### ES6 模块

```javascript
import {of, pipeFrom, map, filter} from 'rx4u';

// 创建数据流
const result$ = pipeFrom(
  of(1, 2, 3, 4, 5),
  filter((x) => x % 2 === 0),
  map((x) => x * 2)
);

const unsub = result$(
  (value) => console.log(value), // 输出: 4, 8
  (error) => console.error(error),
  () => console.log('完成')
);

// 取消订阅
unsub();
```

### CommonJS

```javascript
const {of, pipeFrom, map, filter} = require('rx4u');

// 使用方式相同
```

### CDN 引用

```html
<script src="https://unpkg.com/rx4u/dist/index.min.js"></script>
<script>
  const {of, pipeFrom, map, filter} = rx4u;

  // 使用方式相同
</script>
```

## 📚 核心 API

### 创建函数

#### `from(create)`

从同步工厂函数创建数据流。每次订阅都会调用一次工厂函数并发出返回值。

```javascript
import {from} from 'rx4u';

const random$ = from(() => Math.random());
random$(console.log);
```

#### `fromPromise(create)`

从 Promise 工厂函数创建数据流。每次订阅都会调用一次工厂函数。

```javascript
import {fromPromise} from 'rx4u';

const request$ = fromPromise(() => fetch('/api/data'));
request$(console.log);
```

#### `of(...values)`

从给定的值创建数据流。

```javascript
import {of} from 'rx4u';

of(1, 2, 3)(console.log); // 输出: 1, 2, 3
```

#### `interval(ms)`

创建定时器数据流。

```javascript
import {interval} from 'rx4u';

const unsub = interval(1000)(console.log); // 每秒输出递增数字
```

### 管道操作

#### `pipeFrom(source, ...operators)`

使用管道操作符处理数据流。

```javascript
import {of, pipeFrom, map, filter} from 'rx4u';

const result = pipeFrom(
  of(1, 2, 3, 4, 5),
  filter((x) => x > 2),
  map((x) => x * 2)
);

result(console.log); // 输出: 6, 8, 10
```

### 状态管理

#### `createState(initialValue)`

创建响应式状态。

```javascript
import {createState} from 'rx4u';

const [state, setState] = createState(0);

// 订阅状态变化
state((value) => console.log('状态:', value));

// 更新状态
setState(1); // 输出: 状态: 1
setState((prev) => prev + 1); // 输出: 状态: 2
```

### 工具函数

#### `firstValueFrom(source)`

获取数据流的第一个值作为 Promise。

```javascript
import {firstValueFrom, of} from 'rx4u';

const firstValue = await firstValueFrom(of(1, 2, 3));
console.log(firstValue); // 输出: 1
```

## 🔧 操作符

### 转换操作符

- `map(fn)` - 转换每个值
- `scan(fn, seed)` - 累积操作
- `switchMap(fn)` - 切换到新的数据流

### 过滤操作符

- `filter(predicate)` - 过滤值
- `take(count)` - 取前 N 个值
- `skip(count)` - 跳过前 N 个值
- `distinctUntilChanged(compareFn?, keySelector?)` - 过滤连续重复值

### 组合操作符

- `merge(...sources)` - 合并多个数据流
- `combineLatest(...sources)` - 组合最新值

### 错误处理

- `catchError(handler)` - 捕获错误
- `retry(count)` - 重试

### 工具操作符

- `tap(fn)` - 副作用操作
- `delay(ms)` - 延迟
- `debounceTime(ms)` - 防抖
- `throttleTime(ms, options?)` - 节流

## 💡 使用示例

### 基础数据处理

```javascript
import {of, pipeFrom, map, filter, take} from 'rx4u';

// 处理用户列表
const users = [
  {id: 1, name: 'Alice', age: 25},
  {id: 2, name: 'Bob', age: 30},
  {id: 3, name: 'Charlie', age: 35},
];

pipeFrom(
  of(...users),
  filter((user) => user.age > 25),
  map((user) => user.name),
  take(2)
)(console.log); // 输出: Bob, Charlie
```

### 异步数据处理

```javascript
import {fromPromise, of, pipeFrom, catchError} from 'rx4u';

// API 调用处理
pipeFrom(
  fromPromise(() => fetch('/api/users').then((response) => response.json())),
  catchError((error) => {
    console.error('API 错误:', error);
    return of([]); // 返回空数组作为默认值
  })
)((users) => {
    console.log('用户数据:', users);
});
```

### 状态管理示例

```javascript
import {createState, pipeFrom, map} from 'rx4u';

// 创建计数器状态
const [count, setCount] = createState(0);

// 派生状态
const doubleCount = pipeFrom(count, map((x) => x * 2));

// 订阅状态变化
count((value) => console.log('计数:', value));
doubleCount((value) => console.log('双倍计数:', value));

// 更新状态
setCount(1); // 计数: 1, 双倍计数: 2
setCount((prev) => prev + 1); // 计数: 2, 双倍计数: 4
```

### 错误处理

```javascript
import {fromPromise, of, pipeFrom, map, catchError, retry} from 'rx4u';

pipeFrom(
  fromPromise(() => fetch('/api/data')),
  map((response) => {
    if (!response.ok) {
      throw new Error('网络错误');
    }
    return response.json();
  }),
  retry(3), // 重试 3 次
  catchError((error) => {
    console.error('请求失败:', error);
    return of({error: '数据加载失败'});
  })
)((data) => {
  console.log('数据:', data);
});
```

### 更多操作符示例

#### 组合操作符

```javascript
import { pipeFrom, combineLatest, of, map } from 'rx4u';

const weight$ = of(70, 72, 76, 79, 75);
const height$ = of(1.76, 1.77, 1.78);

const bmi$ = pipeFrom(
  combineLatest(weight$, height$),
  map(([w, h]) => w / (h * h))
);

bmi$(console.log);
```

#### 时间操作符

```javascript
import {pipeFrom, fromEvent, debounceTime, map} from 'rx4u';

const input = document.querySelector('input');
const input$ = fromEvent(input, 'input');

pipeFrom(
  input$,
  map((e) => e.target.value),
  debounceTime(300) // 等待 300ms 停顿
)((value) => {
  console.log('搜索:', value);
});
```

#### 累积操作符

```javascript
import {pipeFrom, of, scan} from 'rx4u';

const numbers$ = of(1, 2, 3);

pipeFrom(
  numbers$,
  scan((acc, curr) => acc + curr, 0) // 求和: 1, 3, 6
)(console.log);
```

## 🔗 TypeScript 支持

rx4u 提供完整的 TypeScript 类型定义：

```typescript
import {of, pipeFrom, map, filter, type Sub, type Operator} from 'rx4u';

// 类型安全的数据流处理
interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  {id: 1, name: 'Alice', age: 25},
  {id: 2, name: 'Bob', age: 30},
];

// TypeScript 会自动推断类型
const names$ = pipeFrom(
  of(...users),
    filter((user: User) => user.age > 25), // User 类型
    map((user: User) => user.name) // string 类型
);

names$((name: string) => {
    // string 类型
    console.log(name);
});
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看文档和示例
2. 搜索已有的 Issues
3. 创建新的 Issue 描述问题

---

**rx4u** - 让响应式编程更简单！
