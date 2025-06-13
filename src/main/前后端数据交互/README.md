## 介绍
“前后端数据交互”主要用于验证前后端数据传递的可行性，我们选择使用flask作为后端框架。前端代码向后端发送用户的任务，后端接受后调用api进行日程规划并返回规划结果的json文件

## 环境配置
python版本不低于3.7

安装依赖，用于api调用
```
pip install openai
```

使用flask框架，在终端中运行
```
pip install flask 
pip install flask-cors
```

获取百炼API Key并在“后端api调用.py”中的13行替换为你的api key

[百炼API Key获取](https://bailian.console.aliyun.com/?tab=model#/api-key)，新用户拥有免费token

## 运行
首先运行后端，建议将后端代码文件命名为app.py，因为使用flask run命令会自动寻找并运行当前目录下的app.py或wsgi.py文件中的 Flask 应用
```
python app.py
或
flask run
```
然后不要关闭终端，在浏览器中打开前端界面。如果你想在VScode中直接打开浏览器可以安装 VS Code 的 Live Server 插件

## 运行效果
![运行效果](../../../video/前后端通讯精简示例.gif)


## 数据传输-后端
使用了flask框架

接收前端数据
``` python
from flask import Flask, request, jsonify
...
data = request.json
user_input = data.get('text', '')
```
request.json 是 Flask 提供的便捷属性，用于解析请求体中的 JSON 数据。当客户端发送的请求满足以下条件时，该属性会自动将 JSON 数据解析为 Python 字典。用字典的 get() 方法从解析后的 JSON 数据中获取 text 字段的值

发送json文件
``` python
 return jsonify({
                # "status": "success",
                "schedule": schedule_data,
                #"raw_content": planner_response_content
            }), 200
```
返回 HTTP 状态码 200（成功），响应体为 JSON，包含 schedule 字段（解析后的日程数据）

## 数据传输-前端
发送用户任务
``` html
使用 Fetch API 发送 POST 请求到http://localhost:5000/api/generate_schedule：
javascript
const response = await fetch('http://localhost:5000/api/generate_schedule', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' // 声明发送JSON数据
    },
    body: JSON.stringify({
        text: userInput // 将用户输入封装为{text: "输入内容"}
    })
});
```

接收后端json文件
``` html
先验证请求是否成功（状态码 200-299）：
javascript
if (!response.ok) {
    throw new Error(`API请求失败，状态码: ${response.status}`);
}
const data = await response.json(); // 解析JSON响应
```

成功时：将 JSON 结果格式化后显示在页面pre标签中
``` html
javascript
result.textContent = JSON.stringify(data, null, 2); // 2个空格缩进
```

错误时：显示错误信息
``` html
javascript
if (data.status === 'error') {
    responseStatus.textContent = `错误: ${data.message}`;
    responseStatus.style.display = 'block';
}
```
