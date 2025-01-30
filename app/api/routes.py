from flask import Blueprint, jsonify, request
from app.metrics.system_metrics import get_system_metrics
from app.metrics.docker_metrics import get_docker_metrics
from app.models.database import db, Server
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