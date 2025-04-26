# 经过api调用后输出的response_output.json文件和本代码放在同一文件夹下
# 由于杂项较多，这里实现了二次解析功能，防止第一次提取为字符串而不是字典

import json

def extract_useful_data(input_file, output_file):
    try:
        # 读取并处理可能的多层JSON编码
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # 首次解析
            try:
                raw_data = json.loads(content)
            except json.JSONDecodeError:
                raise ValueError("❌ 文件内容不是有效JSON格式")

            # 处理双重编码情况
            if isinstance(raw_data, str):
                try:
                    raw_data = json.loads(raw_data)
                except json.JSONDecodeError:
                    raise ValueError("⚠️ 检测到双重编码但解析失败，请检查原始文件结构")

        # 安全提取关键字段
        content_str = raw_data.get('choices', [{}])[0].get('message', {}).get('content')
        if not content_str:
            raise KeyError("🔍 找不到有效内容路径：choices[0].message.content")

        # 智能解析有效内容
        if isinstance(content_str, str):
            try:
                useful_data = json.loads(content_str)
            except json.JSONDecodeError:
                raise ValueError("📄 内容字段包含无效JSON结构")
        else:
            useful_data = content_str  # 直接使用已解析的结构

        # 保存结果
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(useful_data, f, indent=2, ensure_ascii=False)

        print(f"✅ 数据成功保存至：{output_file}")

    except Exception as e:
        print(f"💥 错误详情：{str(e)}")
        print("👉 调试建议：")
        print("- 检查原始文件是否为有效JSON格式")
        print("- 使用在线JSON校验工具验证文件结构")
        print("- 确认内容字段包含有效JSON字符串")

if __name__ == "__main__":
    extract_useful_data("response_output.json", "cleaned_schedule.json")
