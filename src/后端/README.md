## 运行代码

文件可以不命名为app.py，先前建议命名为app.py的原因是flask框架使用flask run命令后会运行名字为app.py的文件。

然而，要想在虚拟手机上与后端通讯，我们不能使用flask run命令，这是因为如果使用了 flask run 命令来启动应用。当使用 flask run 启动时，Flask 会忽略代码中 app.run() 的参数，而是使用环境变量或命令行参数来配置服务器，这样不会产生一个给你使用的局域网ip。

直接使用python运行我们的后端代码
```java
python 文件名字.py
```

运行成功后你应该会在终端下看到如下输出：
```java
python app.py
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://172.19.78.145:5000 //局域网 IP 地址
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 122-442-227
```

根据上面的输出，你需要将前端代码中的 API 请求地址从 http://localhost:5000 改为你的开发机局域网 IP 地址。

将 APICallScreen.js 中的 fetch 请求地址修改为你的局域网 IP：
```java
// 原代码
const response = await fetch('http://localhost:5000/api/generate_schedule', {

// 修改为
const response = await fetch('http://172.19.78.145:5000/api/generate_schedule', {
```
