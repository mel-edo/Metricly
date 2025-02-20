from datetime import datetime 
import psutil
from app.models.database import Metric, db

def convert_bytes(num_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if num_bytes < 1024:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024

def get_system_metrics(current_server_ip):
    system_metrics = {
        'cpu_percent': psutil.cpu_percent(interval=1),  # ✅ Store as float (no "%")
        'memory_info': {
            'total': convert_bytes(psutil.virtual_memory().total),
            'available': convert_bytes(psutil.virtual_memory().available),
            'percent': psutil.virtual_memory().percent,  # ✅ Store as float
            'used': convert_bytes(psutil.virtual_memory().used),
            'free': convert_bytes(psutil.virtual_memory().free)
        },
        'disk_usage': {
            'total': convert_bytes(psutil.disk_usage('/').total),
            'used': convert_bytes(psutil.disk_usage('/').used),
            'free': convert_bytes(psutil.disk_usage('/').free),
            'percent': psutil.disk_usage('/').percent  # ✅ Store as float
        },
        'network_stats': {
            'bytes_sent': convert_bytes(psutil.net_io_counters().bytes_sent),
            'bytes_recv': convert_bytes(psutil.net_io_counters().bytes_recv),
            'packets_sent': psutil.net_io_counters().packets_sent,
            'packets_recv': psutil.net_io_counters().packets_recv
        }
    }

    # ✅ Store metrics in the database correctly
    new_metric = Metric(
        metric_name='system',
        metric_value=system_metrics['cpu_percent'],  # Ensure float type
        timestamp=datetime.now(),
        server_ip=current_server_ip
    )
    
    db.session.add(new_metric)
    db.session.commit()

    return system_metrics  
