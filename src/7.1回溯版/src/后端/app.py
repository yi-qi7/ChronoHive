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
from langchain_core.tools import tool

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
    user_input: str                         # 用户的输入
    user_tasks: str                         # 用户输入的任务列表
    messages: List[Dict[str, str]]          # 存储所有历史消息
    schedule_result: str                    # 日程安排结果
    current_agent: str                      # 当前处理的Agent
    completed: bool                         # 是否完成

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
        # 构建包含系统提示和任务信息的上下文
        # tasks_str = "\n- ".join(state["user_tasks"])
        tasks_str = "\n- ".join(state["user_tasks"].split(',')) # user_tasks 是用逗号分隔的字符串
        memory_str = "\n".join([f"{m['content']}" for m in self.memory[-3:]])
        # 将messages中的字典转换为字符串后再拼接
        messages_str = "\n- ".join([
            f"[{m['agent']}]: {m['content']} \n" 
            for m in state["messages"]
        ])

        return f"""
{self.system_prompt}

用户任务列表：
- {tasks_str}

历史处理记录：
{memory_str}

已获得的信息：
{messages_str}

根据上述信息完成你的工作。
"""
    
    # 构建包含系统提示和用户输入的上下文
    def get_user_context(self, state: ScheduleState) -> str:
        input_str = state["user_input"] 
        memory_str = "\n".join([f"{m['content']}" for m in self.memory[-3:]])
        # 将messages中的字典转换为字符串后再拼接
        messages_str = "\n- ".join([
            f"[{m['agent']}]: {m['content']} \n" 
            for m in state["messages"]
        ])
        return f"""
{self.system_prompt}

用户的输入：
{input_str}

历史处理记录：
{memory_str}

已获得的信息：
{messages_str}

根据上述信息完成你的工作。
"""

planner_response_content = "" # 定义全局变量字符串储存最后的值

# 用户需求解析专家
user_intent = ScheduleAgent(
    "用户需求解析专家",
    "intent",
    """你是一位用户需求解析专家，负责通过用户的输入，提取用户日程需求。
用户的日程需求之间用英文逗号(,)隔开。
输出只需要是普通文本,格式如下:
XXXXXXX,XXXXXXX,XXXXXXXXX,XXX

示例输出：
    完成软件工程作业,学习PCB设计,跑步3km,打游戏2小时
"""
)


# 任务拆解与优先级专家
task_analyst = ScheduleAgent(
    "任务拆解与优先级专家",
    "analyst",
    """你是一位任务拆解与优先级专家，负责为用户的每个任务排列优先级。
请为每个任务给出合理的优先级，数字从1至5（优先级越高的数字越大）。
对于学习类任务和体育锻炼类任务，应该拥有较高的优先级。
对于娱乐消遣类任务应该有较低优先级。
输出只需要是普通文本,格式如下：
任务名称: "XXX", 优先级: X
任务名称: "XXX", 优先级: X

示例输出：
    任务名称: "阅读报告", 优先级: 4
    任务名称: "写邮件", 优先级: 3
"""
)


# 创建任务量估计专家（增强提示）
task_estimator = ScheduleAgent(
    "任务量与时间估计专家",
    "estimator",
    """你是一位任务量与时间估计专家，负责为用户的每个任务估计完成所需时间。
对于优先级较高的任务应该有充足的时间保证能够完成任务量。
请为每个任务给出合理的时间估计（以分钟为单位）。
输出只需要是普通文本，格式如下：
任务名称: "XXX", 预计时间: XX分钟
任务名称: "XXX", 预计时间: XX分钟

示例输出：
    任务名称: "阅读报告", 预计时间: 30分钟
    任务名称: "写邮件", 预计时间: 15分钟
"""
)

# 创建时间安排专家（增强提示）
time_planner = ScheduleAgent(
    "时间规划与日程安排专家",
    "planner",
    """你是一位时间规划与日程安排专家，负责根据任务量估计结果为用户制定合理的日程安排。
请为每个任务确定开始时间和结束时间，确保日程安排合理、连贯。
开始时间不应早于早上8:00，考虑任务之间的休息时间（保证每90分钟任务后休息15分钟）。
考虑午餐和睡午觉的时间，在12:00至14:00之间的时间段最好不要安排任务。
考虑晚餐时间，在18:00至19:00之间的时间段最好不要安排任务。
午餐与晚餐的开始时间可以适当的变动，一定不能与其他任务发生重叠。
对于体育运动，要在运动前后留出适当的的热身和拉伸时间，所以体育运动前后最好留出较长的休息时间，并且不要把体育运动安排在吃饭前，也不要把体育运动安排在吃饭后。
对于优先级较高的任务应该在早上等精力充沛的时间段开始进行，不需要严格按照任务优先级的顺序来执行任务。
一定要注意任务的开始和结束时间段之间不能有其他任务，各个任务之间不能重叠。
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
            "end_time": "10:00",
            "reason": "早上精力充沛适合阅读，所以首先完成阅读任务，阅读预计耗时120分钟"
        },
        {
            "task": "写邮件",
            "start_time": "10:15",
            "end_time": "10:30",
            "reason": "阅读后休息15分钟，所以从10:15开始写邮件，写200字左右大约需要15分钟"
        },
        {
            "task": "午餐与午休",
            "start_time": "12:00",
            "end_time": "14:00",
            "reason": "安排午餐和午休时间，完成任务之余也不要忘记补充营养"
        },
        {
            "task": "晚餐",
            "start_time": "18:00",
            "end_time": "19:00",
            "reason": "安排晚餐时间，放松休息一下吧"
        }
    ],
}
"""
)

# 辅助函数：从文本中提取JSON
def extract_json(text: str) -> str:
    """从文本中提取JSON部分"""
    # 尝试匹配三重反引号之间的JSON
    match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1)
    
    # 尝试匹配最外层的{}或[]
    try:
        # 查找第一个{或[
        start_idx = min(
            (text.find('{'), text.find('[')).count(-1) * len(text) + 
            min(filter(lambda x: x != -1, (text.find('{'), text.find('['))))
        )
        
        # 查找对应的}或]
        if start_idx != -1:
            if text[start_idx] == '{':
                end_idx = text.rfind('}')
            else:
                end_idx = text.rfind(']')
            
            if end_idx > start_idx:
                return text[start_idx:end_idx+1]
    except:
        pass
    
    return text  # 无法提取，返回原始文本

# 辅助函数：修复JSON格式
def fix_json(json_str: str) -> str:
    """尝试修复常见的JSON格式问题"""
    # 移除非JSON字符
    json_str = json_str.strip()
    
    # 检查是否以{或[开头
    if not (json_str.startswith('{') or json_str.startswith('[')):
        # 尝试提取第一个JSON对象
        match = re.search(r'[\[\{]([\s\S]*?)[\]\}]', json_str)
        if match:
            json_str = match.group(0)
    
    # 修复不完整的数组
    if json_str.startswith('[') and not json_str.endswith(']'):
        json_str += ']'
    
    # 修复不完整的对象
    if json_str.startswith('{') and not json_str.endswith('}'):
        json_str += '}'
    
    return json_str


# 定义节点函数
def intent_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    """用户需求解析专家节点处理函数"""
    context = agent.get_user_context(state)
    response = model.invoke([HumanMessage(content=context)])

    print(f"用户需求解析结果为：{response.content}")
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)
    
    # 解析估计结果,输出为txt文本不需要json解析
    attempts = 0
    max_attempts = 0
    
    while attempts < max_attempts:
        try:
            # 提取JSON部分
            json_part = extract_json(response.content)
            # 修复可能的格式问题
            fixed_json = fix_json(json_part)
            # 解析
            estimates = json.loads(fixed_json)
            
            # 验证解析结果
            if not isinstance(estimates, list):
                raise ValueError("解析结果不是JSON数组")
            
            # 检查每个元素是否包含必要的字段
            valid = True
            for item in estimates:
                if not all(key in item for key in ["task", "estimated_time_minutes", "explanation"]):
                    valid = False
                    break
            
            if valid:
                state["task_estimates"] = estimates
                print(f"\n{agent.name}: 成功解析任务估计结果")
                break
            else:
                raise ValueError("解析结果缺少必要字段")
                
        except Exception as e:
            attempts += 1
            if attempts < max_attempts:
                print(f"警告：尝试 {attempts}/{max_attempts} 解析任务估计结果失败: {str(e)}")
                # 请求模型重新生成
                retry_prompt = f"""
                你的上一次输出无法被正确解析为JSON格式。
                请严格按照以下格式重新输出任务估计结果：
                [
                    {{"task": "任务名称", "estimated_time_minutes": 分钟数, "explanation": "估计依据"}}
                ]
                """
                response = model.invoke([HumanMessage(content=retry_prompt)])
            else:
                state["task_estimates"] = []
                print(f"错误：无法解析任务量估计结果，已尝试 {max_attempts} 次")
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    #print(f"\n{agent.name}: {response.content}")
    # 完成估计后转给时间安排专家

    # 更新用户需求
    state["user_tasks"] = response

    return {"state": state, "next": "任务拆解与优先级专家"}



# 定义节点函数
def analyst_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    """任务拆解与优先级专家节点处理函数"""
    context = agent.get_context(state)
    response = model.invoke([HumanMessage(content=context)])

    print(f"优先级结果为：{response.content}")
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)
    
    # 解析估计结果,输出为txt文本不需要json解析
    attempts = 0
    max_attempts = 0
    
    while attempts < max_attempts:
        try:
            # 提取JSON部分
            json_part = extract_json(response.content)
            # 修复可能的格式问题
            fixed_json = fix_json(json_part)
            # 解析
            estimates = json.loads(fixed_json)
            
            # 验证解析结果
            if not isinstance(estimates, list):
                raise ValueError("解析结果不是JSON数组")
            
            # 检查每个元素是否包含必要的字段
            valid = True
            for item in estimates:
                if not all(key in item for key in ["task", "estimated_time_minutes", "explanation"]):
                    valid = False
                    break
            
            if valid:
                state["task_estimates"] = estimates
                print(f"\n{agent.name}: 成功解析任务估计结果")
                break
            else:
                raise ValueError("解析结果缺少必要字段")
        except Exception as e:
            attempts += 1
            if attempts < max_attempts:
                print(f"警告：尝试 {attempts}/{max_attempts} 解析任务估计结果失败: {str(e)}")
                # 请求模型重新生成
                retry_prompt = f"""
                你的上一次输出无法被正确解析为JSON格式。
                请严格按照以下格式重新输出任务估计结果：
                [
                    {{"task": "任务名称", "estimated_time_minutes": 分钟数, "explanation": "估计依据"}}
                ]
                """
                response = model.invoke([HumanMessage(content=retry_prompt)])
            else:
                state["task_estimates"] = []
                print(f"错误：无法解析任务量估计结果，已尝试 {max_attempts} 次")
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    # print(f"\n{agent.name}: {response.content}")
    # 完成估计后转给时间安排专家
    return {"state": state, "next": "任务量与时间估计专家"}


# 定义节点函数
def estimator_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    """任务量与时间估计专家节点处理函数"""
    context = agent.get_context(state)
    response = model.invoke([HumanMessage(content=context)])

    print(f"时间估计结果为：{response.content}")
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)
    
    # 解析估计结果（增强版）
    attempts = 0
    max_attempts = 0
    
    while attempts < max_attempts:
        try:
            # 提取JSON部分
            json_part = extract_json(response.content)
            # 修复可能的格式问题
            fixed_json = fix_json(json_part)
            # 解析
            estimates = json.loads(fixed_json)
            
            # 验证解析结果
            if not isinstance(estimates, list):
                raise ValueError("解析结果不是JSON数组")
            
            # 检查每个元素是否包含必要的字段
            valid = True
            for item in estimates:
                if not all(key in item for key in ["task", "estimated_time_minutes", "explanation"]):
                    valid = False
                    break
            
            if valid:
                state["task_estimates"] = estimates
                print(f"\n{agent.name}: 成功解析任务估计结果")
                break
            else:
                raise ValueError("解析结果缺少必要字段")
                
        except Exception as e:
            attempts += 1
            if attempts < max_attempts:
                print(f"警告：尝试 {attempts}/{max_attempts} 解析任务估计结果失败: {str(e)}")
                # 请求模型重新生成
                retry_prompt = f"""
                你的上一次输出无法被正确解析为JSON格式。
                请严格按照以下格式重新输出任务估计结果：
                [
                    {{"task": "任务名称", "estimated_time_minutes": 分钟数, "explanation": "估计依据"}}
                ]
                """
                response = model.invoke([HumanMessage(content=retry_prompt)])
            else:
                state["task_estimates"] = []
                print(f"错误：无法解析任务量估计结果，已尝试 {max_attempts} 次")
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    # print(f"\n{agent.name}: {response.content}")
    # 完成估计后转给时间安排专家
    return {"state": state, "next": "时间规划与日程安排专家"}


def planner_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    """时间规划与日程安排专家节点处理函数"""
    context = agent.get_context(state)
    print(f"时间规划与日程安排专家的输入context:{context}")
    
    # 在上下文中添加任务估计结果
    # estimates_str = "\n".join([
    #     f"- {est['task']}: {est['estimated_time_minutes']}分钟 ({est['explanation']})" 
    #     for est in state["task_estimates"]
    # ])
    # full_context = f"{context}\n\n任务时间估计结果：\n{estimates_str}"
    
    response = model.invoke([HumanMessage(content=context)])
    
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    agent.update_memory(message)

    # print(f"时间安排专家的输出context:{response.content}")
    
    # 解析安排结果（增强版）
    attempts = 0
    max_attempts = 2 # 最多两次
    
    while attempts < max_attempts:
        try:
            # 提取JSON部分
            json_part = extract_json(response.content)
            # 修复可能的格式问题
            fixed_json = fix_json(json_part)
            # 解析
            schedule = json.loads(fixed_json)
            
            # 验证解析结果
            if not isinstance(schedule, dict) or "schedule" not in schedule:
                raise ValueError("解析结果不是预期的格式（缺少schedule字段）")
            
            # 检查每个任务是否包含必要的字段
            valid = True
            for item in schedule.get("schedule", []):
                if not all(key in item for key in ["task", "start_time", "end_time", "reason"]):
                    valid = False
                    break
            
            if valid:
                state["schedule_result"] = schedule
                print(f"\n{agent.name}: 成功解析日程安排结果")
                break
            else:
                raise ValueError("解析结果缺少必要字段")
                
        except Exception as e:
            attempts += 1
            if attempts < max_attempts:
                print(f"警告：尝试 {attempts}/{max_attempts} 解析日程安排结果失败: {str(e)}")
                # 请求模型重新生成
                retry_prompt = f"""
                你的上一次输出无法被正确解析为JSON格式。
                请严格按照以下格式重新输出日程安排结果：
                {{
                    "schedule": [
                        {{
                            "task": "任务名称",
                            "start_time": "HH:MM",
                            "end_time": "HH:MM",
                            "reason": "安排原因"
                        }},
                        ...
                    ],
                    "reason": "整体安排的主要考虑因素"
                }}
                """
                response = model.invoke([HumanMessage(content=retry_prompt)])
            else:
                state["schedule_result"] = {"schedule": [], "reason": "无法生成有效日程安排"}
                print(f"错误：无法解析日程安排结果，已尝试 {max_attempts} 次")
    
    state["messages"].append(message)
    state["current_agent"] = agent.name
    state["completed"] = True

    # 存储日程结果
    #state["schedule_result"].append(message)
    state["schedule_result"] = response.content

    # 将response.content赋值给全局变量
    global planner_response_content
    planner_response_content = response.content
    
    # print(f"\n{agent.name}: {response.content}")
    # 完成安排后结束流程
    return {"state": state, "next": None}

# 构建图
def build_schedule_graph() -> Graph:
    """构建日程规划流程图"""
    workflow = StateGraph(ScheduleState)
    
    # 添加节点
    # workflow.add_node("任务量估计专家", estimator_node)
    # workflow.add_node("时间安排专家", planner_node)
    # 添加节点（使用lambda函数绑定agent参数）
    workflow.add_node("用户需求解析专家", lambda state, a=user_intent: intent_node(state, a))
    workflow.add_node("任务拆解与优先级专家", lambda state, a=task_analyst: analyst_node(state, a))
    workflow.add_node("任务量与时间估计专家", lambda state, a=task_estimator: estimator_node(state, a))
    workflow.add_node("时间规划与日程安排专家", lambda state, a=time_planner: planner_node(state, a))
    
    # 设置顺序边
    workflow.add_edge("用户需求解析专家", "任务拆解与优先级专家")
    workflow.add_edge("任务拆解与优先级专家", "任务量与时间估计专家")
    workflow.add_edge("任务量与时间估计专家", "时间规划与日程安排专家")
    
    # 设置入口点
    workflow.set_entry_point("用户需求解析专家")
    
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


# 主函数
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

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)

    
