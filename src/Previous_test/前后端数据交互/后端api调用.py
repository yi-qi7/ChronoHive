import os
from flask import Flask, request, jsonify
from flask_cors import CORS 
from openai import OpenAI
import json

app = Flask(__name__)
# 配置CORS，允许所有域名跨域（开发环境）
CORS(app, supports_credentials=True)  # 新增配置

# 配置OpenAI客户端（从环境变量或配置文件读取密钥）
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "your 密钥"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

# 定义API路由，处理日程生成请求
@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():
    try:
        # 从请求中获取用户输入文本
        data = request.json
        user_text = data.get('text')
        
        if not user_text:
            return jsonify({"error": "缺少必要的text参数"}), 400
        
        # 调用OpenAI生成日程
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': user_text}
            ],
        )
        
        # 解析并提取有用数据
        response_data = json.loads(completion.model_dump_json())
        content_str = response_data.get('choices', [{}])[0].get('message', {}).get('content', '[]')
        
        # 尝试解析为JSON
        try:
            schedule_data = json.loads(content_str)
        except json.JSONDecodeError:
            # 如果无法解析为JSON，直接返回原始内容
            schedule_data = {"content": content_str}
        
        return jsonify({
            "status": "success",
            "schedule": schedule_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# 启动应用
if __name__ == '__main__':
    app.run(debug=True, port=5000)
