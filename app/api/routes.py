import docker
from flask import Blueprint, jsonify, request
from app.metrics.system_metrics import get_system_metrics
from app.metrics.docker_metrics import get_docker_metrics
from app.models.database import Metric, db, Server

api_bp = Blueprint('api', __name__)

# ✅ Get system metrics
@api_bp.route('/system', methods=['GET'])
def store_system_metrics():
    current_server_ip = request.args.get("server")
    if not current_server_ip:
        return jsonify({"error": "Missing server IP"}), 400

    metrics = get_system_metrics(current_server_ip)
    return jsonify(metrics)

# ✅ Get Docker metrics
@api_bp.route('/docker', methods=['GET'])
def docker_metrics():
    return jsonify(get_docker_metrics())

# ✅ Get all servers
@api_bp.route('/servers', methods=['GET'])
def get_servers():
    servers = Server.query.all()
    server_list = [{"ip_address": "127.0.0.1"}]  # ✅ Always include localhost
    server_list.extend([{"ip_address": s.ip_address} for s in servers])
    return jsonify(server_list)

# ✅ Add a new server
@api_bp.route('/servers', methods=['POST'])
def add_server():
    data = request.get_json()
    if not data or "ip_address" not in data:
        return jsonify({"error": "Missing ip_address"}), 400

    new_server = Server(ip_address=data["ip_address"])
    db.session.add(new_server)
    db.session.commit()
    return jsonify({"message": "Server added"}), 201

# ✅ Get server metrics from database
@api_bp.route('/servers/<ip>/metrics', methods=['GET'])
def get_server_metrics(ip):
    metrics = Metric.query.filter_by(server_ip=ip).limit(100).all()
    return jsonify([m.to_dict() for m in metrics])

# ✅ Control Docker containers
@api_bp.route('/containers/<container_name>/<action>', methods=['POST'])
def container_action(container_name, action):
    try:
        server_ip = request.args.get('server')
        if not server_ip:
            return jsonify({'error': 'Missing server IP'}), 400  # ✅ Ensure server IP is provided

        # ✅ Connect to remote Docker API
        client = docker.DockerClient(base_url=f"tcp://{server_ip}:2375")

        container = client.containers.get(container_name)  # ✅ Ensure container exists

        # ✅ Perform requested action
        if action == 'restart':
            container.restart()
        elif action == 'stop':
            container.stop()
        elif action == 'start':
            container.start()
        else:
            return jsonify({'error': 'Invalid action'}), 400  # ✅ Handle invalid actions
        
        return jsonify({'message': f'Container {action} successful'}), 200
    except docker.errors.NotFound:
        return jsonify({'error': 'Container not found'}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': f'Docker API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/servers/<ip>', methods=['DELETE'])
def delete_server(ip):
    server = Server.query.filter_by(ip_address=ip).first()
    if not server:
        return jsonify({"error": "Server not found"}), 404

    db.session.delete(server)
    db.session.commit()
    return jsonify({"message": "Server removed"}), 200
