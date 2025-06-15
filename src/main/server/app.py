# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from agents import ScheduleAgent
from workflow import build_schedule_graph, estimator_node, planner_node
from utils import extract_json, fix_json
# ...以及其他相关import（langchain, openai, os, etc.)...

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 1. 初始化AI模型、智能体
# 2. 图/流程初始化
# 3. 路由定义

@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():
    # 见后详细解读
    pass

if __name__ == '__main__':
    app.run(debug=True, port=5000)
