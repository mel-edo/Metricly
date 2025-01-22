from flask import Blueprint, jsonify
from app.metrics.system_metrics import get_and_store_system_metrics
from app.metrics.docker_metrics import get_docker_metrics

api_bp = Blueprint('api', __name__)

@api_bp.route('/store-system', methods=['GET'])
def store_system_metrics():
    metrics = get_and_store_system_metrics()
    return jsonify(metrics)

@api_bp.route('/docker', methods=['GET'])
def docker_metrics():
    return jsonify(get_docker_metrics())
