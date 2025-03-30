import os
from pathlib import Path

# Get the absolute path to the instance directory
basedir = Path(__file__).resolve().parent.parent / 'instance'
basedir.mkdir(exist_ok=True)  # Create instance directory if it doesn't exist

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{basedir}/metricly.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
