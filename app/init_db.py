from app import create_app
from app.models.database import db, User

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create default admin user if it doesn't exist
        admin = User.query.filter_by(email="admin@example.com").first()
        if not admin:
            admin = User(email="admin@example.com", role="admin")
            admin.set_password("admin123")  # Change this password in production!
            db.session.add(admin)
            db.session.commit()
            print("Created default admin user")
        else:
            print("Admin user already exists")

if __name__ == "__main__":
    init_db() 