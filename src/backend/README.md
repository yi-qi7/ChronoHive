# ChronoHive

=w=.
这里是ChronoHive的后端代码。
体系结构如下图所示。
用于发布的apk包并不在仓库代码内。

## Architecture
```
project-root/
│
├── docker/
│   ├── client/
│       ├── Dockerfile
│   ├── server/
│       ├── Dockerfile # 后端dockerfile
│       ├── requirements.txt # 配合dockerfile进行镜像构建
├── server/
│   ├── templates/
│       ├── index.html # 软件下载页
│   ├── static/
│       ├── app-debug.apk # apk包
│   ├── agents.py # 模型提示词
│   ├── app.py # 后端主程序
│   ├── db.py # 数据库连接
│   ├── utils.py # 工具函数
│   ├── workflow.py # agent工作流
│   ├── requirements.txt # 后端依赖
├── docker-compose.yml # docker-compose配置文件
└── README.md

```

## Run

1. Install Docker and Docker Compose
2. Clone the repository
3. Navigate to the project root directory(path/to/backend)
4. Run `docker-compose up` to start the server and client containers

docker镜像安装容易受到网络因素影响，可能需要多次尝试。