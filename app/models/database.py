from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Metric(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

# Example usage
# from datetime import datetime
# new_metric = Metric(metric_name="CPU Usage", metric_value=45.6, timestamp=datetime.now())
