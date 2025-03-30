from datetime import datetime
import psutil
import requests
from app.models.database import Metric, db

def convert_bytes(num_bytes):
    """Convert bytes to human readable format."""
    num_bytes = float(num_bytes)  # Convert to float for division
    for unit in ['', 'K', 'M', 'G', 'T']:
        if abs(num_bytes) < 1024.0:
            return f"{num_bytes:.2f}"  # Return just the number
        num_bytes /= 1024.0
    return f"{num_bytes:.2f}"  # Return just the number

def get_system_metrics(current_server_ip):
    try:
        # If it's localhost, use psutil directly
        if current_server_ip == "127.0.0.1":
            system_metrics = {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'cpu_count': psutil.cpu_count(),
                'memory_info': {
                    'total': float(psutil.virtual_memory().total),
                    'available': float(psutil.virtual_memory().available),
                    'percent': psutil.virtual_memory().percent,
                    'used': float(psutil.virtual_memory().used),
                    'free': float(psutil.virtual_memory().free)
                },
                'disk_usage': {}
            }

            # Get all disk partitions
            for partition in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    system_metrics['disk_usage'][partition.mountpoint] = {
                        'total': float(usage.total),
                        'used': float(usage.used),
                        'free': float(usage.free),
                        'percent': usage.percent
                    }
                except Exception as e:
                    print(f"Error getting disk usage for {partition.mountpoint}: {e}")
                    continue
        else:
            # For remote servers, fetch metrics from their API
            response = requests.get(f"http://{current_server_ip}:5000/api/system", timeout=5)
            if not response.ok:
                raise Exception(f"Failed to fetch metrics from remote server: {response.status_text}")
            system_metrics = response.json()

        # Get root partition disk usage percentage
        root_disk_percent = next(
            (usage['percent'] for mount, usage in system_metrics['disk_usage'].items() if mount == '/'),
            system_metrics['disk_usage'].get(list(system_metrics['disk_usage'].keys())[0], {}).get('percent', 0)
            if system_metrics['disk_usage'] else 0
        )

        # Store metric in database
        new_metric = Metric(
            metric_name='system',
            metric_value=system_metrics['cpu_percent'],
            memory_percent=system_metrics['memory_info']['percent'],
            disk_percent=root_disk_percent,
            memory_info=system_metrics['memory_info'],
            disk_usage=system_metrics['disk_usage'],
            timestamp=datetime.now(),
            server_ip=current_server_ip
        )

        db.session.add(new_metric)
        db.session.commit()

        return system_metrics
    except Exception as e:
        print(f"Error collecting system metrics: {str(e)}")
        raise
