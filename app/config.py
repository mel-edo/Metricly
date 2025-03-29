import os
from pathlib import Path

# Get the absolute path to the app directory
basedir = Path(__file__).resolve().parent

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{basedir}/metricly.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
