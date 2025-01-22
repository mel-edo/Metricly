import docker

client = docker.from_env()

def get_docker_metrics():
    container_metrics = []
    for container in client.containers.list():
        stats = container.stats(stream=False)
        container_metrics.append({
            'name': container.name,
            'cpu_percent': stats['cpu_stats']['cpu_usage']['total_usage'],
            'memory_usage': stats['memory_stats']['usage'],
            'network_io': stats['networks'],
        })
    return container_metrics
print(get_docker_metrics())