from flask import Flask, current_app, send_from_directory
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os

db = SQLAlchemy()
mail = Mail()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:8645@localhost/ticketing_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "59527df04b85a686776c91e7b2561f18d85b3f9d5f649a4468a80a37e3aad259"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'cyberops.lcs@gmail.com'
    app.config['MAIL_PASSWORD'] = 'zieaynrupxmmgvnl'
    app.config['MAIL_DEFAULT_SENDER'] = 'LankaCom Support<cyberops.lcs@gmail.com>'
    
    mail.init_app(app)
    db.init_app(app)
    JWTManager(app)

    # CORS setup
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    # Register API routes
    from app.routes import register_routes
    register_routes(app)

    # ✅ Serve uploaded files from /uploads
    
    
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
        return send_from_directory(uploads_dir, filename)

    return app
