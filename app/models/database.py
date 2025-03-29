from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

# ✅ Metrics Model
class Metric(db.Model):
    m_id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    memory_info = db.Column(db.JSON, nullable=True)
    disk_usage = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    server_ip = db.Column(db.String(15), db.ForeignKey('server.ip_address'), nullable=False)
    server = db.relationship('Server', backref='metrics')

    # ✅ Convert SQLAlchemy Object to Dictionary
    def to_dict(self):
        return {
            "m_id": self.m_id,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "memory_info": self.memory_info,
            "disk_usage": self.disk_usage,
            "timestamp": self.timestamp.isoformat(),  # ✅ Convert datetime to string
            "server_ip": self.server_ip
        }

# ✅ Server Model
class Server(db.Model):
    s_id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), unique=True, nullable=False)

    def __repr__(self):
        return f'<Server {self.ip_address}>'

# ✅ User Model (for Authentication)
class User(db.Model):
    u_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)  # ✅ Store hashed password
    role = db.Column(db.String(10), nullable=False, default="user")  # ✅ Role-based access

    def __repr__(self):
        return f'<User {self.email}>'

    # ✅ Set password (hashed)
    def set_password(self, password):
        self.password = generate_password_hash(password)

    # ✅ Check password
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Threshold(db.Model):
    __tablename__ = 'thresholds'
    
    id = db.Column(db.Integer, primary_key=True)
    server_ip = db.Column(db.String(45), unique=True, nullable=False)
    cpu_threshold = db.Column(db.Float, default=80)
    memory_threshold = db.Column(db.Float, default=80)
    disk_threshold = db.Column(db.Float, default=80)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'cpu': self.cpu_threshold,
            'memory': self.memory_threshold,
            'disk': self.disk_threshold,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
