from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from agents import ScheduleState
from workflow import build_schedule_graph
import agents
from utils import extract_json, fix_json
import json
# db
from db import init_db, save_user_json, get_user_json , init_user_db, create_user, get_user
from flask import send_from_directory



app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, supports_credentials=True)



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

@app.route('/message', methods=['GET'])
def hello_message():
    return jsonify({
        "message": "你好，欢迎访问 ChronoHive！",
        "version": "1.0.0"
    })

@app.route('/download_apk', methods=['GET'])
def download_apk():
    return send_from_directory(
        directory=app.static_folder, 
        path='app-debug.apk', 
        as_attachment=True,
        mimetype='application/vnd.android.package-archive'
    )

# 主函数
@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():

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
            agents.planner_response_content = final_state["schedule_result"]

        # 尝试解析全局变量为JSON
        try:
            # 提取并修复JSON
            text = agents.planner_response_content
            json_part = extract_json(text)
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
                "raw_content": agents.planner_response_content[:500]
            }), 500
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "raw_content": agents.planner_response_content[:500]
        }), 500

@app.route('/api/save_user_json', methods=['POST'])
def save_user_json_route():
    """
    接收json，包含用户名和内容
    {
        "username": "alice",
        "data": { ... }   # 你需要存什么都可以
    }
    """
    try:
        req = request.get_json()
        username = req.get('username')
        data = req.get('data')
        if not username or not data:
            return jsonify({"error": "username and data required"}), 400
        save_user_json(username, data)
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_user_json', methods=['GET'])
def get_user_json_route():
    """
    查询用户所有json（latest first）
    GET /api/get_user_json?username=alice
    """
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "username required"}), 400
    rows = get_user_json(username)
    return jsonify({"data": rows})

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    user_id = create_user(username, password)
    if user_id:
        return jsonify({'message': '注册成功', 'user_id': user_id})
    else:
        return jsonify({'error': '用户名已存在'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    user = get_user(username, password)
    if user:
        return jsonify({'message': '登录成功', 'user': user})
    else:
        return jsonify({'error': '用户名或密码错误'}), 401
    
if __name__ == '__main__':
    # 初始化数据库
    with app.app_context():
        init_db()
        init_user_db()
        initialize_graph()
    app.run(host='0.0.0.0', port=5000)
    
