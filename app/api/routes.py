from flask import Blueprint, jsonify, render_template
from app.metrics.system_metrics import get_system_metrics
from app.metrics.docker_metrics import get_docker_metrics

api_bp = Blueprint('metrics', __name__)

@api_bp.route('/')
def index():
    return render_template('index.html')

@api_bp.route('/system', methods=['GET'])
def store_system_metrics():
    metrics = get_system_metrics()
    return jsonify(metrics)

@api_bp.route('/docker', methods=['GET'])
def docker_metrics():
    return jsonify(get_docker_metrics())
