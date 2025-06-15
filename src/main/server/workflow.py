# workflow.py
from datetime import datetime
from agents import ScheduleAgent

def estimator_node(state, agent: ScheduleAgent, model) -> dict:
    # ...和原本类似，去掉全局变量...

def planner_node(state, agent: ScheduleAgent, model) -> dict:
    # ...和原本一样...

def build_schedule_graph(task_estimator, time_planner, StateGraph, ScheduleState, model):
    # ...复用构建流程...
