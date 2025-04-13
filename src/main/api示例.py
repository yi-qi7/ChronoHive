from openai import OpenAI
import json

client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key="你的api key", 
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
completion = client.chat.completions.create(
    model="qwen-plus", # 此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    messages=[
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': '我今天将要完成软件工程作业，学习pcb设计，跑步3km，打游戏2小时。按照综合考虑任务的优先级与时长为我安排我今天的日程,只需给出时间段和任务'}],
    )

print(completion.model_dump_json())

# 获取返回的JSON数据
response_json = completion.model_dump_json()

# 将JSON数据保存到文件
output_file = "response_output.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(response_json, f, ensure_ascii=False, indent=4)

print(f"输出已保存为: {output_file}")
