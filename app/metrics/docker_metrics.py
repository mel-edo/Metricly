import docker
from datetime import datetime

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

def get_directory_size(path):
    """Calculate total size of a directory in bytes."""
    total_size = 0
    try:
        import os
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if os.path.exists(fp):
                    total_size += os.path.getsize(fp)
        return total_size
    except Exception as e:
        print(f"Error calculating directory size for {path}: {str(e)}")
        return 0

def get_uptime(container_info):
    """Calculate container uptime in a human-readable format."""
    try:
        created = container_info.get('Created', '')
        if not created:
            print("No creation time found in container info")
            return 'Unknown'
        
        # Parse the creation time
        # Docker API returns ISO format with 'Z' suffix
        created_time = datetime.fromisoformat(created.replace('Z', '+00:00'))
        current_time = datetime.now(created_time.tzinfo)
        
        # Calculate uptime
        uptime = current_time - created_time
        
        # Convert to human-readable format
        days = uptime.days
        hours = uptime.seconds // 3600
        minutes = (uptime.seconds % 3600) // 60
        seconds = uptime.seconds % 60
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
    except Exception as e:
        print(f"Error calculating uptime: {str(e)}")
        print(f"Container info: {container_info}")
        return 'Unknown'

def get_docker_metrics():
    container_metrics = []
    for container in client.containers.list():
        try:
            stats = container.stats(stream=False)
            
            # Get container details
            container_info = container.attrs
            print(f"\nProcessing container: {container.name}")
            print(f"Container info: {container_info}")
            
            # Calculate uptime
            uptime = get_uptime(container_info)
            print(f"Calculated uptime: {uptime}")
            
            # Get network stats
            networks = stats.get('networks', {})
            network_stats = {}
            for network_name, network_data in networks.items():
                network_stats[network_name] = {
                    'rx_bytes': convert_bytes(network_data.get('rx_bytes', 0)),
                    'tx_bytes': convert_bytes(network_data.get('tx_bytes', 0)),
                    'rx_packets': network_data.get('rx_packets', 0),
                    'tx_packets': network_data.get('tx_packets', 0),
                    'rx_errors': network_data.get('rx_errors', 0),
                    'tx_errors': network_data.get('tx_errors', 0),
                    'rx_dropped': network_data.get('rx_dropped', 0),
                    'tx_dropped': network_data.get('tx_dropped', 0)
                }

            # Get volume information with actual sizes
            volumes = []
            mounts = container_info.get('Mounts', [])
            print(f"Found {len(mounts)} mounts for container {container.name}")
            
            for mount in mounts:
                try:
                    print(f"\nProcessing mount for {container.name}:")
                    print(f"Mount details: {mount}")
                    
                    # Get volume size
                    volume_size = 0
                    mount_type = mount.get('Type', '')
                    source = mount.get('Source', '')
                    
                    if mount_type == 'bind' and source:
                        print(f"Calculating size for bind mount: {source}")
                        volume_size = get_directory_size(source)
                        print(f"Calculated size: {volume_size} bytes")
                    elif mount_type == 'volume':
                        volume_name = mount.get('Name')
                        if volume_name:
                            try:
                                volume = client.volumes.get(volume_name)
                                volume_info = volume.attrs
                                if 'UsageData' in volume_info and volume_info['UsageData']:
                                    volume_size = volume_info['UsageData'].get('Size', 0)
                            except Exception as e:
                                print(f"Error getting volume info: {str(e)}")

                    volume_info = {
                        'source': source,
                        'destination': mount.get('Destination', 'Unknown'),
                        'type': mount_type,
                        'size': convert_bytes(volume_size)
                    }
                    print(f"Final volume info: {volume_info}")
                    volumes.append(volume_info)
                except Exception as e:
                    print(f"Error processing mount for {container.name}: {str(e)}")
                    volume_info = {
                        'source': mount.get('Source', 'Unknown'),
                        'destination': mount.get('Destination', 'Unknown'),
                        'type': mount.get('Type', 'Unknown'),
                        'size': 'Unknown'
                    }
                    volumes.append(volume_info)

            # Safely get port mappings
            ports = {}
            network_settings = container_info.get('NetworkSettings', {})
            if network_settings and 'Ports' in network_settings:
                for port, mappings in network_settings['Ports'].items():
                    if mappings:  # Only add if mappings exist
                        ports[port] = mappings

            # Calculate CPU percentage safely
            cpu_usage = stats.get('cpu_stats', {}).get('cpu_usage', {}).get('total_usage', 0)
            system_cpu = stats.get('cpu_stats', {}).get('system_cpu_usage', 0)
            cpu_percent = round(cpu_usage / (system_cpu + 0.0001) * 100, 2) if system_cpu > 0 else 0

            # Get memory stats safely
            memory_stats = stats.get('memory_stats', {})
            memory_usage = memory_stats.get('usage', 0)
            memory_limit = memory_stats.get('limit', 0)

            metrics = {
                'name': container.name,
                'id': container.short_id,
                'status': container.status,
                'cpu_percent': cpu_percent,
                'memory_usage': convert_bytes(memory_usage),
                'memory_limit': convert_bytes(memory_limit),
                'network_stats': network_stats,
                'ports': ports,
                'size': convert_bytes(container_info.get('SizeRootFs', 0)),
                'created': container_info.get('Created', ''),
                'uptime': uptime,
                'image': container.image.tags[0] if container.image.tags else "Unknown",
                'volumes': volumes
            }
            print(f"Final metrics for {container.name}: {metrics}")
            container_metrics.append(metrics)
        except Exception as e:
            print(f"Error fetching stats for container {container.name}: {str(e)}")
            # Add basic container info even if stats fail
            container_metrics.append({
                'name': container.name,
                'id': container.short_id,
                'status': container.status,
                'cpu_percent': 0,
                'memory_usage': '0B',
                'memory_limit': '0B',
                'network_stats': {},
                'ports': {},
                'size': '0B',
                'created': container_info.get('Created', ''),
                'uptime': 'Unknown',
                'image': container.image.tags[0] if container.image.tags else "Unknown",
                'volumes': []
            })

    return container_metrics
