import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict, Any, TypedDict
from datetime import datetime, timedelta
import re
import json
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import Graph, StateGraph

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 配置模型
model = ChatOpenAI(
    model="qwen-turbo",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    api_key=os.environ.get("OPENAI_API_KEY", "sk-90219972706f4202911eeae13b1ce835"),
    temperature=0.7
)

# 定义状态类型
class ScheduleState(TypedDict):
    user_tasks: str                  # 用户输入的任务列表
    messages: List[Dict[str, str]]   # 存储所有历史消息
    schedule_result: str             # 日程安排结果
    current_agent: str               # 当前处理的Agent
    completed: bool                  # 是否完成

# 定义Agent的基础类
class ScheduleAgent:
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.memory: List[Dict] = []
    
    def update_memory(self, message: Dict):
        self.memory.append(message)
    
    def get_context(self, state: ScheduleState) -> str:
        tasks_str = "\n- ".join(state["user_tasks"].split(','))
        memory_str = "\n".join([f"{m['content']}" for m in self.memory[-3:]])
        messages_str = "\n- ".join([
            f"[{m['agent']}]: {m['content']} \n" 
            for m in state["messages"]
        ])

        return f"""
{self.system_prompt}

用户任务列表：
-  {tasks_str}

历史处理记录：
{memory_str}

已获得的信息：
{messages_str}

请根据上述信息完成你的工作。
        """

# 定义全局变量存储最终结果
planner_response_content = ""

# 创建任务量估计专家
task_estimator = ScheduleAgent(
    "任务量估计专家",
    "estimator",
    """你是一位任务量估计专家，负责为用户的每个任务估计完成所需时间。
请为每个任务给出合理的时间估计（以分钟为单位）。
输出只需要是普通文本

示例输出：
    任务名称: "阅读报告", 预计时间: 30分钟
    任务名称: "写邮件", 预计时间: 15分钟
    """
)

# 创建时间安排专家
time_planner = ScheduleAgent(
    "时间安排专家",
    "planner",
    """你是一位时间安排专家，负责根据任务量估计结果为用户制定合理的日程安排。
请为每个任务确定开始时间和结束时间，确保日程安排合理、连贯。
开始时间应从早上8:00开始，考虑任务之间的休息时间（每90分钟任务后休息15分钟）。
考虑午餐和睡午觉的时间，在12:00至14:00的时间段最好不要安排任务。
对于体育运动，要在运动前后留出适当的热身和拉伸时间，所以体育运动前后最好留出较长的休息时间。
输出必须是严格有效的JSON对象，格式如下：
{
    "schedule": [
        {
            "task": "任务名称",
            "start_time": "HH:MM格式的开始时间",
            "end_time": "HH:MM格式的结束时间",
            "reason": "安排此任务的简要原因"
        },
            ...
    ],
}

示例输出：
{
    "schedule": [
        {
            "task": "阅读报告",
            "start_time": "08:00",
            "end_time": "08:30",
            "reason": "早上精力充沛适合阅读，所以首先完成阅读任务，阅读预计耗时30分钟"
        },
        {
            "task": "写邮件",
            "start_time": "08:45",
            "end_time": "09:00",
            "reason": "阅读后休息15分钟，写邮件200字左右大约需要15分钟"
        }
    ],
}
"""
)

# 辅助函数：从文本中提取JSON
def extract_json(text: str) -> str:
    match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1)
    
    try:
        start_idx = min(
            (text.find('{'), text.find('[')).count(-1) * len(text) + 
            min(filter(lambda x: x != -1, (text.find('{'), text.find('['))))
        )
        if start_idx != -1:
            if text[start_idx] == '{':
                end_idx = text.rfind('}')
            else:
                end_idx = text.rfind(']')
            if end_idx > start_idx:
                return text[start_idx:end_idx+1]
    except:
        pass
    return text

# 辅助函数：修复JSON格式
def fix_json(json_str: str) -> str:
    json_str = json_str.strip()
    if not (json_str.startswith('{') or json_str.startswith('[')):
        match = re.search(r'[\[\{]([\s\S]*?)[\]\}]', json_str)
        if match:
            json_str = match.group(0)
    if json_str.startswith('[') and not json_str.endswith(']'):
        json_str += ']'
    if json_str.startswith('{') and not json_str.endswith('}'):
        json_str += '}'
    return json_str

# 定义节点函数
def estimator_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    context = agent.get_context(state)
    response = model.invoke([HumanMessage(content=context)])
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    print(f"\n{agent.name}: {response.content}")
    return {"state": state, "next": "时间安排专家"}

def planner_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    global planner_response_content
    context = agent.get_context(state)
    print(f"时间安排专家的输入context:{context}")
    
    response = model.invoke([HumanMessage(content=context)])
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)
    print(f"时间安排专家的输出context:{response.content}")
    
    # 解析安排结果
    attempts = 0
    max_attempts = 2
    
    while attempts < max_attempts:
        try:
            json_part = extract_json(response.content)
            fixed_json = fix_json(json_part)
            schedule = json.loads(fixed_json)
            
            if isinstance(schedule, dict) and "schedule" in schedule:
                for item in schedule.get("schedule", []):
                    if all(key in item for key in ["task", "start_time", "end_time", "reason"]):
                        state["schedule_result"] = schedule
                        print(f"\n{agent.name}: 成功解析日程安排结果")
                        break
                # 检查是否成功设置了schedule_result
                if state["schedule_result"] != "无内容":
                    break  # 退出while循环
                else:
                    attempts += 1
            else:
                raise ValueError("解析结果格式不正确")
                
        except Exception as e:
            attempts += 1
            if attempts < max_attempts:
                print(f"警告：尝试 {attempts}/{max_attempts} 解析失败: {str(e)}")
                retry_prompt = f"""
                请严格按照以下格式重新输出日程安排结果：
                {{
                    "schedule": [
                        {{
                            "task": "任务名称",
                            "start_time": "HH:MM",
                            "end_time": "HH:MM",
                            "reason": "安排原因"
                        }}
                    ]
                }}
                """
                response = model.invoke([HumanMessage(content=retry_prompt)])
            else:
                state["schedule_result"] = {"schedule": [], "reason": "无法生成有效日程安排"}
                print(f"错误：解析失败，已尝试 {max_attempts} 次")
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    state["completed"] = True
    state["schedule_result"] = response.content
    
    # 赋值给全局变量
    planner_response_content = response.content
    
    print(f"\n{agent.name}: {response.content}")
    return {"state": state, "next": None}

# 构建图
def build_schedule_graph() -> Graph:
    workflow = StateGraph(ScheduleState)
    workflow.add_node("任务量估计专家", lambda state, a=task_estimator: estimator_node(state, a))
    workflow.add_node("时间安排专家", lambda state, a=time_planner: planner_node(state, a))
    workflow.add_edge("任务量估计专家", "时间安排专家")
    workflow.set_entry_point("任务量估计专家")
    return workflow.compile()

# 初始化图
graph_initialized = False
schedule_graph = None

@app.before_request
def initialize_graph():
    global graph_initialized, schedule_graph
    if not graph_initialized:
        schedule_graph = build_schedule_graph()
        graph_initialized = True
        print("日程规划图已初始化")

@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():
    global planner_response_content
    try:
        data = request.json
        user_tasks = data.get('text', '')
        
        if not user_tasks:
            return jsonify({"error": "缺少text参数"}), 400
        
        print(f"接收到用户任务: {user_tasks}")
        
        # 初始化状态
        initial_state = ScheduleState(
            user_tasks=user_tasks,
            messages=[],
            schedule_result="无内容",
            current_agent="任务量估计专家",
            completed=False
        )
        
        # 运行图处理
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

