import docker
import jwt
from datetime import datetime, timedelta
import requests
import socket
from flask import Blueprint, jsonify, request
from functools import wraps
from werkzeug.security import check_password_hash
from app.metrics.system_metrics import get_system_metrics
from app.metrics.docker_metrics import get_docker_metrics
from app.models.database import Metric, db, Server, User, Threshold  # ✅ Ensure User model exists
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

api_bp = Blueprint('api', __name__)
limiter = Limiter(key_func=get_remote_address)

# Get secret key from environment variable
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your_secret_key')  # Fallback for development
TOKEN_EXPIRATION = int(os.environ.get('TOKEN_EXPIRATION_HOURS', 24))  # Default 24 hours

# ✅ Middleware to protect routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token.split("Bearer ")[-1], SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(username=data["username"]).first()
            if not current_user:
                return jsonify({"error": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    
    return decorated

# ✅ User registration route
@api_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already registered"}), 400

    try:
        user = User(username=data["username"])
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500

# ✅ User login route
@api_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    print(f"Login attempt received for username: {data.get('username')}")  # Debug log
    
    if not data or "username" not in data or "password" not in data:
        print("Missing username or password")  # Debug log
        return jsonify({"error": "Missing username or password"}), 400

    try:
        print("Attempting to query user from database...")  # Debug log
        user = User.query.filter_by(username=data["username"]).first()
        print(f"User found: {user is not None}")  # Debug log
        print(f"User details: {user.__dict__ if user else None}")  # Debug log
        
        if user:
            password_check = user.check_password(data["password"])
            print(f"Password check result: {password_check}")  # Debug log
            print(f"Provided password: {data['password']}")  # Debug log
        
        if user and password_check:
            token = jwt.encode(
                {
                    "username": user.username,
                    "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRATION)
                },
                SECRET_KEY,
                algorithm="HS256",
            )
            print("Login successful, token generated")  # Debug log
            return jsonify({"token": token})
        
        print("Login failed: Invalid credentials")  # Debug log
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        print(f"Full error details: {repr(e)}")  # Debug log
        return jsonify({"error": "Login failed", "details": str(e)}), 500

# ✅ Get system metrics (public access)
@api_bp.route('/system', methods=['GET'])
def store_system_metrics():
    try:
        current_server_ip = request.args.get("server")
        if not current_server_ip:
            return jsonify({"error": "Missing server IP"}), 400

        # Check if server exists (except for localhost)
        if current_server_ip != "127.0.0.1":
            server = Server.query.filter_by(ip_address=current_server_ip).first()
            if not server:
                return jsonify({"error": "Server not found"}), 404

        try:
            metrics = get_system_metrics(current_server_ip)
        except Exception as e:
            print(f"Error collecting system metrics: {str(e)}")
            return jsonify({"error": str(e)}), 500
        
        # Validate metrics data
        if not metrics:
            return jsonify({"error": "Failed to collect metrics"}), 500
            
        # Ensure all required fields are present
        required_fields = {
            'cpu_percent': 0,
            'memory_info': {'total': 0, 'used': 0, 'percent': 0},
            'disk_usage': {'/': {'total': 0, 'used': 0, 'percent': 0}}
        }
        
        # Fill in missing fields with defaults
        if 'memory_info' not in metrics or not metrics['memory_info']:
            metrics['memory_info'] = required_fields['memory_info']
        if 'disk_usage' not in metrics or not metrics['disk_usage']:
            metrics['disk_usage'] = required_fields['disk_usage']
            
        return jsonify(metrics)
    except Exception as e:
        print(f"Error in store_system_metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ✅ Get Docker metrics (public access)
@api_bp.route('/docker', methods=['GET'])
def docker_metrics():
    return jsonify(get_docker_metrics())

# ✅ Get all servers (protected)
@api_bp.route('/servers', methods=['GET'])
@token_required
def get_servers():
    servers = Server.query.all()
    server_list = [{"ip_address": "127.0.0.1"}]  # ✅ Always include localhost
    server_list.extend([{"ip_address": s.ip_address} for s in servers])
    return jsonify(server_list)

# ✅ Add a new server (protected)
@api_bp.route('/servers', methods=['POST'])
@token_required
def add_server():
    data = request.get_json()
    if not data or "ip_address" not in data:
        return jsonify({"error": "Missing ip_address"}), 400

    new_server = Server(ip_address=data["ip_address"])
    db.session.add(new_server)
    db.session.commit()
    return jsonify({"message": "Server added"}), 201

# ✅ Get server metrics from database (protected)
@api_bp.route('/servers/<ip>/metrics', methods=['GET'])
@token_required
def get_server_metrics(ip):
    try:
        # Validate server exists (except for localhost)
        if ip != "127.0.0.1":
            server = Server.query.filter_by(ip_address=ip).first()
            if not server:
                return jsonify({"error": "Server not found"}), 404

        time_range = request.args.get('timeRange', '1h')
        current_time = datetime.utcnow()
        
        if time_range == '1h':
            start_time = current_time - timedelta(hours=1)
        elif time_range == '24h':
            start_time = current_time - timedelta(days=1)
        elif time_range == '7d':
            start_time = current_time - timedelta(days=7)
        else:
            return jsonify({'error': 'Invalid time range'}), 400

        # Get historical metrics
        historical_metrics = Metric.query.filter(
            Metric.server_ip == ip,
            Metric.metric_name == 'system',
            Metric.timestamp >= start_time
        ).order_by(Metric.timestamp.asc()).all()

        formatted_metrics = []
        
        # Get the latest metrics first
        try:
            latest_metrics = get_system_metrics(ip)
            if latest_metrics:
                latest_data = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'cpu_percent': float(latest_metrics.get('cpu_percent', 0)),
                    'memory_info': latest_metrics.get('memory_info', {}),
                    'disk_usage': latest_metrics.get('disk_usage', {})
                }
                formatted_metrics.append(latest_data)
        except Exception as e:
            print(f"Error getting latest metrics: {str(e)}")

        # Format historical metrics
        for metric in historical_metrics:
            try:
                metric_data = {
                    'timestamp': metric.timestamp.isoformat(),
                    'cpu_percent': float(metric.metric_value or 0),
                    'memory_info': metric.memory_info or {},
                    'disk_usage': metric.disk_usage or {}
                }
                formatted_metrics.append(metric_data)
            except (ValueError, TypeError, AttributeError) as e:
                print(f"Error formatting metric: {e}")
                continue

        return jsonify(formatted_metrics)
    except Exception as e:
        print(f"Error in get_server_metrics: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ✅ Control Docker containers (protected)
@api_bp.route('/containers/<container_name>/<action>', methods=['POST'])
@token_required
def container_action(container_name, action):
    try:
        server_ip = request.args.get('server')
        if not server_ip:
            return jsonify({'error': 'Missing server IP'}), 400

        # Use socket file for localhost, TCP for remote servers
        if server_ip == "127.0.0.1":
            client = docker.from_env()
        else:
            client = docker.DockerClient(base_url=f"tcp://{server_ip}:2375")

        container = client.containers.get(container_name)

        # ✅ Perform requested action
        if action == 'restart':
            container.restart()
        elif action == 'stop':
            container.stop()
        elif action == 'start':
            container.start()
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        return jsonify({'message': f'Container {action} successful'}), 200
    except docker.errors.NotFound:
        return jsonify({'error': 'Container not found'}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': f'Docker API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Delete a server (protected)
@api_bp.route('/servers/<ip>', methods=['DELETE'])
@token_required
def delete_server(ip):
    try:
        if ip == "127.0.0.1":
            return jsonify({"error": "Cannot remove localhost"}), 400

        server = Server.query.filter_by(ip_address=ip).first()
        if not server:
            return jsonify({"message": "Server not found"}), 404

        try:
            # Delete associated metrics first
            Metric.query.filter_by(server_ip=ip).delete()
            
            # Delete associated thresholds
            Threshold.query.filter_by(server_ip=ip).delete()
            
            # Delete the server
            db.session.delete(server)
            db.session.commit()
            
            return jsonify({"message": "Server removed successfully"}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Database error while removing server: {str(e)}")
            return jsonify({"error": "Database error while removing server"}), 500
            
    except Exception as e:
        print(f"Error removing server: {str(e)}")
        return jsonify({"error": "Failed to remove server"}), 500

def check_server_connection(ip_address):
    try:
        # Try to connect to the server's API
        response = requests.get(f"http://{ip_address}:5000/api/health", timeout=5)
        return response.ok, None
    except requests.exceptions.RequestException as e:
        return False, str(e)

@api_bp.route("/server/<ip>/status")
@token_required
def get_server_status(ip):
    is_online, error = check_server_connection(ip)
    return jsonify({
        "isOnline": is_online,
        "error": error
    })

@api_bp.route("/health")
def health_check():
    return jsonify({"status": "healthy"}), 200

@api_bp.route('/containers/<container_name>/logs', methods=['GET'])
@token_required
def get_container_logs(container_name):
    try:
        server_ip = request.args.get('server')
        if not server_ip:
            return jsonify({'error': 'Missing server IP'}), 400

        # Use socket file for localhost, TCP for remote servers
        if server_ip == "127.0.0.1":
            client = docker.from_env()
        else:
            client = docker.DockerClient(base_url=f"tcp://{server_ip}:2375")
            
        container = client.containers.get(container_name)
        
        # Get container logs
        logs = container.logs(tail=100, timestamps=True).decode('utf-8')
        
        return jsonify({'logs': logs}), 200
    except docker.errors.NotFound:
        return jsonify({'error': 'Container not found'}), 404
    except docker.errors.APIError as e:
        return jsonify({'error': f'Docker API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/servers/<ip>/thresholds', methods=['GET', 'POST'])
@token_required
def server_thresholds(ip):
    try:
        if request.method == 'GET':
            thresholds = Threshold.query.filter_by(server_ip=ip).first()
            if not thresholds:
                # Return default thresholds if none set
                return jsonify({
                    'cpu': 80,
                    'memory': 80,
                    'disk': 80
                })
            return jsonify(thresholds.to_dict())
        
        elif request.method == 'POST':
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            thresholds = Threshold.query.filter_by(server_ip=ip).first()
            if not thresholds:
                thresholds = Threshold(server_ip=ip)
                db.session.add(thresholds)

            thresholds.cpu_threshold = data.get('cpu', 80)
            thresholds.memory_threshold = data.get('memory', 80)
            thresholds.disk_threshold = data.get('disk', 80)

            db.session.commit()
            return jsonify(thresholds.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/servers/<ip>/docker/metrics', methods=['GET'])
def get_docker_metrics_history(ip):
    try:
        print(f"Fetching Docker metrics history for server {ip}")
        time_range = request.args.get('timeRange', '1h')
        print(f"Time range: {time_range}")
        
        # Convert time range to seconds
        range_map = {
            '1h': 3600,
            '24h': 86400,
            '7d': 604800
        }
        seconds = range_map.get(time_range, 3600)
        
        # Get metrics from database for each container
        metrics = {}
        try:
            containers = get_docker_metrics()
            print(f"Found {len(containers)} containers")
        except Exception as e:
            print(f"Error getting Docker containers: {e}")
            containers = []
        
        for container in containers:
            try:
                container_name = container.get('name')
                print(f"\nProcessing container: {container_name}")
                
                container_metrics = Metric.query.filter(
                    Metric.metric_name == f"docker_{container_name}",
                    Metric.server_ip == ip,
                    Metric.timestamp >= datetime.now() - timedelta(seconds=seconds)
                ).order_by(Metric.timestamp.asc()).all()
                
                print(f"Found {len(container_metrics)} historical metrics for {container_name}")
                
                # Parse memory usage and limit
                memory_usage = container.get('memory_usage', '0 MB')
                memory_limit = container.get('memory_limit', '0 MB')
                print(f"Current memory usage: {memory_usage}, limit: {memory_limit}")
                
                # Convert memory strings to MB
                def parse_memory(mem_str):
                    try:
                        if not mem_str or mem_str == '0 MB':
                            return 0
                        parts = mem_str.split(' ')
                        if len(parts) != 2:
                            print(f"Invalid memory string format: {mem_str}")
                            return 0
                        value = float(parts[0])
                        unit = parts[1].upper()
                        if unit == 'B':
                            return value / (1024 * 1024)
                        elif unit == 'KB':
                            return value / 1024
                        elif unit == 'GB':
                            return value * 1024
                        elif unit == 'TB':
                            return value * 1024 * 1024
                        return value  # Already in MB
                    except Exception as e:
                        print(f"Error parsing memory string {mem_str}: {e}")
                        return 0
                
                memory_used_mb = parse_memory(memory_usage)
                memory_limit_mb = parse_memory(memory_limit)
                print(f"Parsed memory - used: {memory_used_mb}MB, limit: {memory_limit_mb}MB")
                
                # Get container status and health information
                container_status = container.get('status', 'unknown')
                is_running = container_status == 'running'
                restart_count = container.get('restart_count', 0)
                exit_code = container.get('exit_code', 0)
                
                # Add current metrics to the list
                current_metrics = {
                    'timestamp': datetime.now().isoformat(),
                    'cpu_percent': float(container.get('cpu_percent', 0)),
                    'memory_used': memory_used_mb,
                    'memory_limit': memory_limit_mb,
                    'status': container_status,
                    'is_running': is_running,
                    'restart_count': restart_count,
                    'exit_code': exit_code
                }
                print(f"Current metrics for {container_name}:", current_metrics)
                
                # Add historical metrics
                historical_metrics = [{
                    'timestamp': m.timestamp.isoformat(),
                    'cpu_percent': float(m.metric_value or 0),
                    'memory_used': float(m.memory_percent or 0),
                    'memory_limit': memory_limit_mb,  # Use current limit for historical data
                    'status': container_status,
                    'is_running': is_running,
                    'restart_count': restart_count,
                    'exit_code': exit_code
                } for m in container_metrics]
                
                metrics[container_name] = historical_metrics + [current_metrics]
                
                # Store current metrics in database
                new_metric = Metric(
                    metric_name=f"docker_{container_name}",
                    metric_value=float(container.get('cpu_percent', 0)),
                    memory_percent=memory_used_mb,  # Store as MB
                    timestamp=datetime.now(),
                    server_ip=ip
                )
                db.session.add(new_metric)
                print(f"Added new metric for {container_name} to database")
            except Exception as e:
                print(f"Error processing container {container.get('name', 'unknown')}: {e}")
                continue
        
        try:
            db.session.commit()
            print("Successfully committed metrics to database")
        except Exception as e:
            db.session.rollback()
            print(f"Error storing Docker metrics: {e}")
        
        print(f"Returning metrics for {len(metrics)} containers")
        return jsonify(metrics)
    except Exception as e:
        print(f"Error in get_docker_metrics_history: {e}")
        return jsonify({"error": str(e)}), 500

@api_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.get_json()
    
    if not data or 'old_password' not in data or 'new_password' not in data:
        return jsonify({"error": "Missing old or new password"}), 400

    try:
        # Get current user from token
        token = request.headers.get("Authorization").split("Bearer ")[-1]
        user_data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        current_user = User.query.filter_by(username=user_data["username"]).first()

        if not current_user:
            return jsonify({"error": "User not found"}), 404

        # Verify old password
        if not current_user.check_password(data['old_password']):
            return jsonify({"error": "Current password is incorrect"}), 401

        # Set new password
        current_user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({"message": "Password updated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
