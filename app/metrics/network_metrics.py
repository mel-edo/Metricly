import psutil
import time
from datetime import datetime

def convert_bytes(num_bytes):
    """Convert bytes to human readable format."""
    num_bytes = float(num_bytes)  # Convert to float for division
    for unit in ['', 'K', 'M', 'G', 'T']:
        if abs(num_bytes) < 1024.0:
            return f"{num_bytes:.2f} {unit}B"
        num_bytes /= 1024.0
    return f"{num_bytes:.2f} PB"  # Return in PB if very large

def get_network_interfaces():
    """Get all network interfaces and their addresses."""
    interfaces = []
    
    # Get network interfaces
    net_if_addrs = psutil.net_if_addrs()
    net_if_stats = psutil.net_if_stats()
    
    # Get initial counters for calculating speeds
    initial_counters = psutil.net_io_counters(pernic=True)
    
    # Wait a short time to calculate speeds
    time.sleep(0.5)
    
    # Get updated counters
    counters = psutil.net_io_counters(pernic=True)
    
    # Process each interface
    for interface_name, addrs in net_if_addrs.items():
        # Skip loopback interfaces if not on localhost
        if interface_name.startswith('lo'):
            continue
            
        # Get interface stats
        if interface_name in net_if_stats:
            is_up = net_if_stats[interface_name].isup
        else:
            is_up = False
            
        # Get IP addresses
        ipv4 = ''
        ipv6 = ''
        for addr in addrs:
            if addr.family == 2:  # AF_INET (IPv4)
                ipv4 = addr.address
            elif addr.family == 23 or addr.family == 10:  # AF_INET6 (IPv6)
                ipv6 = addr.address
                
        # Calculate speeds
        download_speed = 0
        upload_speed = 0
        download_total = 0
        upload_total = 0
        
        if interface_name in counters and interface_name in initial_counters:
            # Calculate bytes per second
            rx_bytes = counters[interface_name].bytes_recv
            tx_bytes = counters[interface_name].bytes_sent
            rx_bytes_initial = initial_counters[interface_name].bytes_recv
            tx_bytes_initial = initial_counters[interface_name].bytes_sent
            
            time_diff = 0.5  # seconds
            download_speed = (rx_bytes - rx_bytes_initial) / time_diff
            upload_speed = (tx_bytes - tx_bytes_initial) / time_diff
            
            # Total bytes
            download_total = rx_bytes
            upload_total = tx_bytes
            
        interfaces.append({
            'name': interface_name,
            'ip': ipv4 or ipv6 or 'No IP',
            'status': 'active' if is_up else 'inactive',
            'downloadSpeed': convert_bytes(download_speed) + '/s',
            'uploadSpeed': convert_bytes(upload_speed) + '/s',
            'downloadTotal': convert_bytes(download_total),
            'uploadTotal': convert_bytes(upload_total)
        })
        
    return interfaces

def get_network_stats():
    """Get network statistics for all interfaces."""
    interfaces = get_network_interfaces()
    
    return {
        'interfaces': interfaces,
        'timestamp': datetime.now().isoformat()
    }
