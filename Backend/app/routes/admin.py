from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Admin
import jwt
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
import datetime

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/register", methods=["POST"])
def register_admin():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")
        password = data.get("password")

        if not all([name, email, mobile, password]):
            return jsonify({"error": "All fields are required"}), 400

        existing_admin = Admin.query.filter_by(email=email).first()
        if existing_admin:
            return jsonify({"error": "Admin with this email already exists"}), 409

        new_admin = Admin(name=name, email=email, mobile=mobile)
        new_admin.set_password(password)

        db.session.add(new_admin)
        db.session.commit()

        return jsonify({"message": "Admin created successfully!"}), 201

    except Exception as e:
        print("Error in register_admin:", e)
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route("/all", methods=["GET"])
def get_all_admins():
    admins = Admin.query.all()
    admin_list = [
        {"id": admin.id, "name": admin.name, "email": admin.email, "mobile": admin.mobile}
        for admin in admins
    ]
    return jsonify(admin_list), 200


@admin_bp.route("/delete/<int:admin_id>", methods=["DELETE"])
def delete_admin(admin_id):
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin deleted successfully"}), 200


@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Check if this is the hardcoded maintainer login
    if email == "maintainer@gmail.com" and password == "maintainer@123456":
        # Return a dummy token or special token for maintainer
        token = generate_jwt_token_for_maintainer()  # You can create a special token or just a fixed string
        maintainer_info = {
            "id": 0,
            "name": "Maintainer Super Admin",
            "email": "maintainer@gmail.com"
        }
        return jsonify({"token": token, "admin": maintainer_info}), 200

    # Otherwise, normal DB authentication
    admin = Admin.query.filter_by(email=email).first()
    if admin and admin.check_password(password):
        token = generate_jwt_token(admin)
        return jsonify({"token": token, "admin": {"id": admin.id, "name": admin.name, "email": admin.email,"mobile": admin.mobile,}}), 200

    return jsonify({"message": "Invalid email or password"}), 401


def generate_jwt_token(admin):
    payload = {
        "id": admin.id,
        "email": admin.email,
        "name": admin.name,
        "mobile": admin.mobile,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')


def generate_jwt_token_for_maintainer():
    payload = {
        "id": 0,
        "email": "maintainer",
        "name": "Maintainer Super Admin",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
        "role": "maintainer"
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token if isinstance(token, str) else token.decode('utf-8')



