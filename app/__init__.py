from flask import Flask
from flask_cors import CORS
from app.models.database import db
from flask_migrate import Migrate  # ✅ Add Flask-Migrate

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///servers.db'
    CORS(app)
    app.config.from_object('app.config.Config')
    db.init_app(app)
    Migrate(app, db)  # ✅ Use Migrations Instead

    with app.app_context():
        from app.api.routes import api_bp
        app.register_blueprint(api_bp, url_prefix='/metrics')
        
    return app
