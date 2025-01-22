from app.models.database import db, Metric
from datetime import datetime
import psutil

def get_and_store_system_metrics():
    # metrics = {
    #     'cpu_percent': psutil.cpu_percent(interval=1),
    #     'memory_percent': psutil.virtual_memory().percent,
    #     'disk_percent': psutil.disk_usage('/').percent
    # }
    # for metric_name, metric_value in metrics.items():
    #     new_metric = Metric(metric_name=metric_name, metric_value=metric_value, timestamp=datetime.now())
    #     db.session.add(new_metric)
    # db.session.commit()
    # return metrics
    return {
        'cpu_percent': psutil.cpu_percent(interval=1),
        'memory_info': psutil.virtual_memory()._asdict(),
        'disk_usage': psutil.disk_usage('/')._asdict(),
        'network_stats': psutil.net_io_counters(pernic=False)._asdict(),
    }
