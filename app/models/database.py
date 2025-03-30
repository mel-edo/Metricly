from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from sqlalchemy import UniqueConstraint

db = SQLAlchemy()

# ✅ Metrics Model
class Metric(db.Model):
    __tablename__ = 'metric'
    
    m_id = db.Column('m_id', db.Integer, primary_key=True)
    metric_name = db.Column('metric_name', db.String(50), nullable=False)
    metric_value = db.Column('metric_value', db.Float, nullable=False)  # CPU percentage
    memory_percent = db.Column('memory_percent', db.Float, nullable=True)  # Memory percentage
    disk_percent = db.Column('disk_percent', db.Float, nullable=True)  # Disk percentage
    memory_info = db.Column('memory_info', db.JSON, nullable=True)  # Full memory info
    disk_usage = db.Column('disk_usage', db.JSON, nullable=True)  # Full disk info
    timestamp = db.Column('timestamp', db.DateTime, nullable=False)
    server_ip = db.Column('server_ip', db.String(15), db.ForeignKey('server.ip_address'), nullable=False)
    server = db.relationship('Server', backref='metrics')

    # ✅ Convert SQLAlchemy Object to Dictionary
    def to_dict(self):
        return {
            "m_id": self.m_id,
            "metric_name": self.metric_name,
            "cpu_percent": self.metric_value,
            "memory_percent": self.memory_percent,
            "disk_percent": self.disk_percent,
            "memory_info": self.memory_info,
            "disk_usage": self.disk_usage,
            "timestamp": self.timestamp.isoformat(),  # ✅ Convert datetime to string
            "server_ip": self.server_ip
        }

# ✅ Server Model
class Server(db.Model):
    __tablename__ = 'server'
    
    s_id = db.Column('s_id', db.Integer, primary_key=True)
    ip_address = db.Column('ip_address', db.String(15), unique=True, nullable=False)

    def __repr__(self):
        return f'<Server {self.ip_address}>'

# ✅ User Model (for Authentication)
class User(db.Model):
    __tablename__ = 'user'
    
    u_id = db.Column('u_id', db.Integer, primary_key=True, autoincrement=True)
    username = db.Column('username', db.Text, nullable=False)
    password = db.Column('password', db.Text, nullable=False)
    role = db.Column('role', db.Text, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('username', name='uq_user_username'),
    )

    def __repr__(self):
        return f'<User {self.username}>'

    # ✅ Set password (hashed)
    def set_password(self, password):
        self.password = generate_password_hash(password)

    # ✅ Check password
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Threshold(db.Model):
    __tablename__ = 'thresholds'
    
    id = db.Column('id', db.Integer, primary_key=True)
    server_ip = db.Column('server_ip', db.String(45), unique=True, nullable=False)
    cpu_threshold = db.Column('cpu_threshold', db.Float, default=80)
    memory_threshold = db.Column('memory_threshold', db.Float, default=80)
    disk_threshold = db.Column('disk_threshold', db.Float, default=80)
    created_at = db.Column('created_at', db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column('updated_at', db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'cpu': self.cpu_threshold,
            'memory': self.memory_threshold,
            'disk': self.disk_threshold,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
