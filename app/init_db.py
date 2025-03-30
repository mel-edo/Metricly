import sqlite3
import os
from pathlib import Path
from werkzeug.security import generate_password_hash

def init_db():
    # Create instance directory if it doesn't exist
    instance_path = Path(__file__).resolve().parent.parent / 'instance'
    instance_path.mkdir(exist_ok=True)
    
    # Database path
    db_path = instance_path / 'metricly.db'
    
    # Remove existing database
    if db_path.exists():
        os.remove(db_path)
    
    # Create new database and tables
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.executescript("""
    CREATE TABLE user (
        u_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    );
    
    CREATE TABLE server (
        s_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE metric (
        m_id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        memory_percent REAL,
        disk_percent REAL,
        memory_info JSON,
        disk_usage JSON,
        timestamp DATETIME NOT NULL,
        server_ip TEXT NOT NULL,
        FOREIGN KEY(server_ip) REFERENCES server(ip_address)
    );
    
    CREATE TABLE thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_ip TEXT NOT NULL UNIQUE,
        cpu_threshold REAL DEFAULT 80,
        memory_threshold REAL DEFAULT 80,
        disk_threshold REAL DEFAULT 80,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Create admin user
    admin_password = generate_password_hash('admin')
    cursor.execute(
        "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
        ('admin', admin_password, 'admin')
    )
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db() 