import docker
from flask import Blueprint, jsonify, request
from app.metrics.system_metrics import get_system_metrics
from app.metrics.docker_metrics import get_docker_metrics
from app.models.database import Metric, db, Server
import subprocess, re


api_bp = Blueprint('api', __name__)

@api_bp.route('/system', methods=['GET'])
def store_system_metrics():
    metrics = get_system_metrics()
    return jsonify(metrics)

@api_bp.route('/docker', methods=['GET'])
def docker_metrics():
    return jsonify(get_docker_metrics())

@api_bp.route('/servers', methods=['POST'])
def add_server():
    ip_address = request.json.get('ip_address')
    if not ip_address:
        return jsonify({'error': 'IP address is required'}), 400

    server = Server(ip_address=ip_address)
    db.session.add(server)
    db.session.commit()
    return jsonify({'message': 'Server added successfully'}), 201

@api_bp.route('/scan', methods=['GET'])
def scan_network():
    result = subprocess.run(['nmap', '-sn', '192.168.1.0/24'], capture_output=True, text=True)
    ip_addresses = re.findall(r'\d+\.\d+\.\d+\.\d+', result.stdout)

    for ip in ip_addresses:
        if not Server.query.filter_by(ip_address=ip).first():
            server = Server(ip_address=ip)
            db.session.add(server)
    
    db.session.commit()
    return jsonify({'message': 'Network scan complete', 'ip_addresses': ip_addresses}), 200

@api_bp.route('/servers/<ip>/metrics', methods=['GET'])
def get_server_metrics(ip):
    # Logic to fetch historical metrics from database
    metrics = Metric.query.filter_by(server_ip=ip).limit(100).all()
    return jsonify([m.to_dict() for m in metrics])

@api_bp.route('/containers/<container_name>/<action>', methods=['POST'])
def container_action(container_name, action):
    try:
        server_ip = request.args.get('server')
        # Logic to connect to specific server's docker daemon
        client = docker.DockerClient(base_url=f"tcp://{server_ip}:2375")
        container = client.containers.get(container_name)
        
        if action == 'restart':
            container.restart()
        elif action == 'stop':
            container.stop()
        elif action == 'start':
            container.start()
            
        return jsonify({'message': f'Container {action} successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500