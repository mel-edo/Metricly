from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.config.Config')
    db.init_app(app)

    with app.app_context():
        from app.api.routes import api_bp
        app.register_blueprint(api_bp, url_prefix='/metrics')
        
        return app
