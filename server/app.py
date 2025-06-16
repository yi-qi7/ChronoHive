from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from agents import ScheduleState
from workflow import build_schedule_graph
from utils import extract_json, fix_json
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 1. 初始化AI模型、智能体
# 2. 图/流程初始化
# 3. 路由定义

graph_initialized = False
schedule_graph = None

def initialize_graph():
    global graph_initialized
    global schedule_graph
    if not graph_initialized:
        schedule_graph = build_schedule_graph()
        graph_initialized = True
        print("日程规划图已初始化")

@app.route('/', methods=['GET'])
def default_handler():
    return render_template('index.html')

@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():
    global planner_response_content
    
    try:
        data = request.json
        user_input = data.get('text', '')

        if not user_input:
            return jsonify({"error": "缺少text参数"}), 400
        
        print(f"接收到用户任务: {user_input}")
        
        # 初始化状态
        initial_state = ScheduleState(
            user_input = user_input,
            user_tasks = user_input,
            messages=[],
            schedule_result="无内容",       # 初始化为空字典
            current_agent="任务量估计专家",
            completed=False
        )
        
        # 运行图并逐轮处理
        final_state = None
        for output in schedule_graph.stream(initial_state):
            if isinstance(output, dict) and "state" in output:
                state = output["state"]
                if state["completed"]:
                    final_state = state
                    break
        
        # 确保全局变量已更新
        if final_state and "schedule_result" in final_state:
            planner_response_content = final_state["schedule_result"]

        # 尝试解析全局变量为JSON
        try:
            # 提取并修复JSON
            json_part = extract_json(planner_response_content)
            fixed_json = fix_json(json_part)
            schedule_data = json.loads(fixed_json)
            
            return jsonify({
                # "status": "success",
                "schedule": schedule_data,
                #"raw_content": planner_response_content
            }), 200
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"解析结果失败: {str(e)}",
                "raw_content": planner_response_content[:500]
            }), 500
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "raw_content": planner_response_content[:500]
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    initialize_graph()
