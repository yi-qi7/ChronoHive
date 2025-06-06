# 环境配置
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

# 运行
首先运行后端，建议将后端代码文件命名为app.py，因为使用flask run命令会自动寻找并运行当前目录下的app.py或wsgi.py文件中的 Flask 应用
```
python app.py
或
flask run
```
然后不要关闭终端，在浏览器中打开前端界面

运行效果
![运行效果](../../../video/前后端通讯精简示例.gif)
