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

def init_user_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,         -- 实际生产请加密存储(如hash!)
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    ''')
    conn.commit()
    conn.close()

def create_user(username, password):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        return None

def get_user(username, password):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, created_at FROM users WHERE username=? AND password=?', (username, password))
    row = c.fetchone()
    conn.close()
    if row:
        return {'id': row[0], 'username': row[1], 'created_at': row[2]}
    return None