from typing import List, Dict, TypedDict
from langchain_openai import ChatOpenAI
import os
import workflow

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
    
    # 构建日程评价的上下文
    def get_value_context(self, state: ScheduleState) -> str:
        input_str = workflow.planner_response_content 
        memory_str = "\n".join([f"{m['content']}" for m in self.memory[-3:]])
        
        return f"""
{self.system_prompt}

历史处理记录：
{memory_str}

日程规划结果：
{input_str}

根据上述信息完成你的工作。
"""


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

# 创建日程评价专家
task_evaluate = ScheduleAgent(
    "日程评价专家",
    "evaluate",
    """你是一位日程评价专家，负责评价用户的日程规划是否合理。
日程规划结果将会以json格式输入，每个日程会给出开始时间和结束时间。
作为日程评价专家，你需要评价用户的日程规划结果是否合理。
如果日程之间的时间出现重叠，即在同一时间内安排了两个日程，则日程规划不合理。
如果没有重叠，则认为日程规划合理。
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