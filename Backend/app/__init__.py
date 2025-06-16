from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # CORS fix
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:8645@localhost/ticketing_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "59527df04b85a686776c91e7b2561f18d85b3f9d5f649a4468a80a37e3aad259"

    db.init_app(app)

    # Register routes
    from app.routes import register_routes
    register_routes(app)

    return app
