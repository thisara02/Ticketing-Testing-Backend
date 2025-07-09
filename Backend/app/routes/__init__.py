from .admin import admin_bp
# from .auth import auth_bp
from .customer import customer_bp
from .engineer import engineer_bp
from .ticket import ticket_bp
from .accountmanager import accountmanager_bp

def register_routes(app):
    app.register_blueprint(admin_bp)
    # app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(engineer_bp)
    app.register_blueprint(ticket_bp)
    app.register_blueprint(accountmanager_bp)

