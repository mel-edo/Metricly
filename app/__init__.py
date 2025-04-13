from flask import Flask
from flask_cors import CORS
from app.models.database import db
from flask_migrate import Migrate
import os
from app.middleware import CORSMiddleware

def create_app():
    app = Flask(__name__)
    # Configure CORS to allow all requests (for development only)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Apply our custom CORS middleware
    app.wsgi_app = CORSMiddleware(app.wsgi_app)

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    app.config.from_object('app.config.Config')  # Load config first

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)  # Initialize Flask-Migrate

    with app.app_context():
        from app.api.routes import api_bp
        app.register_blueprint(api_bp, url_prefix='/api')

    return app
