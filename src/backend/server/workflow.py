from datetime import datetime
from typing import Dict
import json
import re
from utils import extract_json, fix_json
from langgraph.graph import StateGraph

from langchain_core.messages import HumanMessage

# import ScheduleAgent from your agents.py!
from agents import ScheduleAgent, ScheduleState, model, user_intent, task_analyst, task_estimator, time_planner, task_evaluate
# 2. 节点函数

planner_response_content = "" # 定义全局变量字符串储存最后的值

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
    return {"state": state, "next": "日程评价专家"}

def value_node(state: ScheduleState, agent: ScheduleAgent) -> Dict:
    """日程评价专家节点处理函数"""
    context = agent.get_value_context(state)
    print(f"日程评价专家的输入context:{context}")
    
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

# 3. 构建任务流图

# 构建图
def build_schedule_graph():
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
    workflow.add_node("日程评价专家", lambda state, a=task_evaluate: value_node(state, a))
    
    # 设置顺序边
    workflow.add_edge("用户需求解析专家", "任务拆解与优先级专家")
    workflow.add_edge("任务拆解与优先级专家", "任务量与时间估计专家")
    workflow.add_edge("任务量与时间估计专家", "时间规划与日程安排专家")
    workflow.add_edge("时间规划与日程安排专家", "日程评价专家")
    
    # 设置入口点
    workflow.set_entry_point("用户需求解析专家")
    
    return workflow.compile()
