import psutil


def convert_bytes(num_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if num_bytes < 1024:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024

def get_system_metrics():

    system_metrics = {
        'cpu_percent': f"{psutil.cpu_percent(interval=1)}%",
        'memory_info': {
            'total': convert_bytes(psutil.virtual_memory().total),
            'available': convert_bytes(psutil.virtual_memory().available),
            'percent': f"{psutil.virtual_memory().percent}%",
            'used': convert_bytes(psutil.virtual_memory().used),
            'free': convert_bytes(psutil.virtual_memory().free)
        },
        'disk_usage': {
            'total': convert_bytes(psutil.disk_usage('/').total),
            'used': convert_bytes(psutil.disk_usage('/').used),
            'free': convert_bytes(psutil.disk_usage('/').free),
            'percent': f"{psutil.disk_usage('/').percent}%"
        },
        'network_stats': {
            'bytes_sent': convert_bytes(psutil.net_io_counters(pernic=False).bytes_sent),
            'bytes_recv': convert_bytes(psutil.net_io_counters(pernic=False).bytes_recv),
            'packets_sent': psutil.net_io_counters(pernic=False).packets_sent,
            'packets_recv': psutil.net_io_counters(pernic=False).packets_recv
        }
    }

    return system_metrics 
