import re
import json

def extract_json(text: str) -> str:
    '''尝试从文本中提取出 JSON 部分'''
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

def fix_json(json_str: str) -> str:
    '''修复不完整JSON字符串结尾'''
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
