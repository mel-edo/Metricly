from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Metric(db.Model):
    m_id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    server_ip = db.Column(db.String(15), db.ForeignKey('server.ip_address'))
    server = db.relationship('Server', backref='metrics')

class Server(db.Model):
    s_id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), unique=True, nullable=False)

    def __repr__(self):
        return f'<Server {self.ip_address}>'