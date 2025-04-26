graph LR
3 A[方形] -->B(圆角)
4     B --> C{条件a}
5     C -->|a=1| D[结果1]
6     C -->|a=2| E[结果2]
7     F[横向流程图]

## 流程

用户输入日程（txt） -> api调用 -> response_output.json -> 杂项处理 -> cleaned_schedule.json -> 显示日程

## 介绍

在“核心功能实现”文件夹下，我们用python实现了api调用功能并且规定了json文件格式，成功在web端显示了我们的日程

- **api调用**

  使用python代码实现了api调用通义千问(qwq)进行日程规划并写入json文件的功能

- **response_output**

  api示例输出的json文件，有杂项，需要用脚本再处理一遍

- **杂项处理**

  处理杂项的脚本文件，读取response_output的信息并将杂项剔除，得到干净的cleaned_schedule

- **cleaned_schedule**

  被读取的json文件，里面存放json数组结构，每个对象中包含任务名称、开始时间、结束时间三个元素(🎯可动态调整，未来应该还要加上原因等)

- **显示日程**

  支持动态读取json文件

  **注意**！本地运行时会出现 CORS 问题，如果你在本地直接打开 HTML 文件（例如 file:// 协议），浏览器可能会阻止加载 JSON 文件。这是因为浏览器的跨域资源共享（CORS）政策会禁止通过文件协议请求资源。

  解决方法是通过 Web 服务器来托管文件，我们采用最便捷的方式：使用 VS Code 的 Live Server 插件。安装后即可正常读取并显示

## 补充

全部文件放在同一文件夹下

  
