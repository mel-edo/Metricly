import docker

client = docker.from_env()

def convert_bytes(size_bytes):
    """Convert bytes to human-readable format."""
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = 0
    while size_bytes >= 1024 and i < len(size_name) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{round(size_bytes, 2)} {size_name[i]}"

def get_docker_metrics():
    container_metrics = []
    for container in client.containers.list():
        try:
            stats = container.stats(stream=False)
            
            # ✅ Handle missing SizeRootFs
            size = container.attrs.get('SizeRootFs', 0)  
            
            # ✅ Handle missing Ports
            ports = container.attrs['NetworkSettings']['Ports'] or {}

            # Format ports
            formatted_ports = {}
            for port, mappings in ports.items():
                formatted_ports[port] = [m['HostPort'] for m in mappings] if mappings else ["Not Exposed"]

            metrics = {
                'name': container.name,
                'id': container.short_id,
                'status': container.status,
                'cpu_percent': round(stats['cpu_stats']['cpu_usage']['total_usage'] / (stats['cpu_stats']['system_cpu_usage'] + 0.0001) * 100, 2),
                'memory_usage': convert_bytes(stats['memory_stats']['usage']),
                'memory_limit': convert_bytes(stats['memory_stats']['limit']),
                'network_io': {
                    'rx_bytes': convert_bytes(stats.get('networks', {}).get('eth0', {}).get('rx_bytes', 0)),
                    'tx_bytes': convert_bytes(stats.get('networks', {}).get('eth0', {}).get('tx_bytes', 0))
                },
                'ports': formatted_ports,  # ✅ Store formatted ports
                'size': convert_bytes(container.attrs.get('SizeRootFs', 0)),
                'created': container.attrs.get('Created', ''),
                'image': container.image.tags[0] if container.image.tags else "Unknown"
            }
            container_metrics.append(metrics)
        except Exception as e:
            print(f"Error fetching stats for {container.name}: {e}")

    return container_metrics
