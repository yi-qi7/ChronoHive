注意，在App.js中引用另外两个文件的代码为
```js
import WeekCalendar from './weekUI/WeekCalendar';
import EventFormScreen from './weekUI/EventFormScreen';
import APICallScreen from './WeekUI/APICallScreen'; // 导入 API 页
```
所以需要在App.js所在目录下创建一个叫weekUI的文件夹，并把WeekCalendar.js、APICallScreen.js和EventFormScreen.js文件其中代码放入才可正常执行

周界面由杨鑫编写并实现相应接口，由赵施琦在此基础上加入Api调用界面以及自动添加日程功能的实现
