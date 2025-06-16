from datetime import datetime
from typing import Dict
import json
import re
from utils import extract_json, fix_json

from langchain_core.messages import HumanMessage

# import ScheduleAgent from your agents.py!
from agents import ScheduleAgent
# 2. 节点函数

def estimator_node(state: dict, agent: ScheduleAgent, model) -> dict:
    """任务量与时间估计专家节点处理函数"""
    context = agent.get_context(state)
    response = model.invoke([HumanMessage(content=context)])

    # 保存消息
    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    agent.update_memory(message)

    # 可选：如需解析内容，自行添加容错逻辑
    state["messages"].append(message)
    state["current_agent"] = agent.name
    return {"state": state, "next": "时间规划与日程安排专家"}

def planner_node(state: dict, agent: ScheduleAgent, model) -> dict:
    """时间规划与日程安排专家节点处理函数"""
    context = agent.get_context(state)
    response = model.invoke([HumanMessage(content=context)])

    message = {
        "agent": agent.name,
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    agent.update_memory(message)

    # 这里可选：解析并存储JSON到state["schedule_result"]，否则直接保存输出
    # 保证 downstream 代码兼容
    state["messages"].append(message)
    state["current_agent"] = agent.name
    state["completed"] = True
    state["schedule_result"] = response.content
    return {"state": state, "next": None}

# 3. 构建任务流图

def build_schedule_graph(
    task_estimator: ScheduleAgent,
    time_planner: ScheduleAgent,
    StateGraph,                # Graph 构造器，如 langgraph.graph.StateGraph
    ScheduleState,             # TypedDict 类型
    model
):
    """流程图构建，完全无全局变量，全部参数外部传递"""
    workflow = StateGraph(ScheduleState)
    # 注意：此处建议你外部补全 intent_node、analyst_node 类似于上面写法，并在调用时传入
    # 这里只示意构建最后两步

    workflow.add_node("任务量与时间估计专家", lambda s: estimator_node(s, task_estimator, model))
    workflow.add_node("时间规划与日程安排专家", lambda s: planner_node(s, time_planner, model))

    # 可视需求补充前置节点
    # workflow.add_edge("上一节点", "任务量与时间估计专家")
    workflow.add_edge("任务量与时间估计专家", "时间规划与日程安排专家")
    # workflow.add_edge("时间规划与日程安排专家", XXX) # 终结

    workflow.set_entry_point("任务量与时间估计专家")
    return workflow.compile()
