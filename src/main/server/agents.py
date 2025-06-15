# agents.py
from typing import List, Dict
class ScheduleAgent:
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.memory: List[Dict] = []

    def update_memory(self, message: Dict):
        self.memory.append(message)

    def get_context(self, state) -> str:
        # ...如你的代码...
        pass

# 单例智能体在其他文件中创建。例如
