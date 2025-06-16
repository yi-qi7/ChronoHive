import sqlite3
from typing import Any, Dict

DB_PATH = 'user_data.db'

def init_db():
    # 初始化数据库，建表（表只需建一次）
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_json (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_user_json(username: str, json_data: Dict[str, Any]):
    import json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO user_json (username, content)
        VALUES (?, ?)
    ''', (username, json.dumps(json_data)))
    conn.commit()
    conn.close()

def get_user_json(username: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        SELECT content, created_at FROM user_json
        WHERE username=?
        ORDER BY created_at DESC
    ''', (username,))
    rows = c.fetchall()
    conn.close()
    # 反序列化json为Python对象
    import json
    return [{'content': json.loads(r[0]), 'created_at': r[1]} for r in rows]
