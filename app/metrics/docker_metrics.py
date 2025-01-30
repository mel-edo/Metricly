import docker

client = docker.from_env()

def convert_bytes_to_human_readable(size_bytes):
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = int((len(str(size_bytes)) - 1) / 3)
    p = pow(1024, i)
    size = round(size_bytes / p, 2)
    return f"{size} {size_name[i]}"

def calculate_cpu_percent(stats):
    try:
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']

        if 'percpu_usage' in stats['cpu_stats']['cpu_usage']:
            cpu_count = len(stats['cpu_stats']['cpu_usage']['percpu_usage'])
        else:
            cpu_count = 1 

        if system_delta > 0 and cpu_delta > 0:
            cpu_percent = (cpu_delta / system_delta) * cpu_count * 100
            return round(cpu_percent, 2)
    except KeyError as e:
        print(f"Warning: Missing key in stats - {e}")
    
    return 0.0 

def get_docker_metrics():
    container_metrics = []
    for container in client.containers.list():
        try:
            stats = container.stats(stream=False)
            
            metrics = {
                'name': container.name,
                'cpu_percent': f"{calculate_cpu_percent(stats)}%", 
                'memory_usage': convert_bytes_to_human_readable(stats['memory_stats']['usage']),  
                'network_io': {
                    'rx_bytes': convert_bytes_to_human_readable(stats['networks'].get('eth0', {}).get('rx_bytes', 0)),
                    'tx_bytes': convert_bytes_to_human_readable(stats['networks'].get('eth0', {}).get('tx_bytes', 0)), 
                },
            }
            container_metrics.append(metrics)
        except Exception as e:
            print(f"Error fetching stats for {container.name}: {e}")

    return container_metrics

print(get_docker_metrics())
