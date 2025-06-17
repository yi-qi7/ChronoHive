## 介绍
实现了多agent的日程规划

2agent.py是两个agent交互进行日程规划的版本，最终在终端输出日程规划json文件，而2agent_flask.py实现了两个agent在flask框架下与前端index.html消息通讯的版本的版本，更多信息参考[数据交互](../前后端数据交互)

同理，4agent实现了四个agent交互进行日程规划

## 环境配置
python版本不低于3.9(langgraph需要)

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

安装LangGraph，LangGraph 是一个用于使用大型语言模型（LLMs）构建有状态、多参与者应用程序的库。
```
pip install langgraph
```

## 2agent
- 第一个估计任务量
- 第二个根据任务量安排日程

图结构：

任务量估计专家 -> 日程规划专家

## 4agent
- 第一个从用户输入中提取用户需求
- 第二个排列任务优先级
- 第三个估计任务量
- 第四个根据优先级和任务量安排日程

图结构：

用户需求解析专家 -> 任务拆解与优先级专家 -> 任务量估计专家 -> 日程规划专家


