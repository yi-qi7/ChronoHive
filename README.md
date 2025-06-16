# ChronoHive

ChronoHive is a lightweight, scalable, and distributed framework for processing and analyzing time-series data. It provides a simple and intuitive interface for users to define and execute complex workflows, while also providing a robust set of tools for data collection, storage, and processing.

## Architecture

project-root/
│
├── docker/
│   ├── client/
│       ├── Dockerfile
│   ├── server/
│       ├── Dockerfile
├── server/
│   ├── agents.py
│   ├── app.py
│   ├── utils.py
│   ├── workflow.py
│   ├── requirements.txt
├── docker-compose.yml

## Run

1. Install Docker and Docker Compose
2. Clone the repository
3. Navigate to the project root directory
4. Run `docker-compose up` to start the server and client containers