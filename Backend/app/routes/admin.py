from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Admin
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random
from app.utils.email_utils import send_admin_otp_email
from app.models import OTPModel
from app.utils.email_utils import send_otp_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")

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

    # 🔐 Maintainer login (bypass OTP)
    if email == "maintainer@gmail.com" and password == "maintainer@123456":
        token = generate_jwt_token_for_maintainer()
        maintainer_info = {
            "id": 0,
            "name": "Maintainer Super Admin",
            "email": "maintainer@gmail.com"
        }
        return jsonify({
            "token": token,
            "admin": maintainer_info,
            "bypass_otp": True  # ✅ Used by frontend to skip OTP screen
        }), 200

    # 🔐 Normal Admin login
    admin = Admin.query.filter_by(email=email).first()
    if admin and admin.check_password(password):
        otp = str(random.randint(100000, 999999))
        admin.otp = otp
        admin.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        db.session.commit()

        send_admin_otp_email(email, otp)

        return jsonify({
            "message": "OTP sent to your email",
            "admin_id": admin.id,
            "bypass_otp": False  # ✅ Used by frontend
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401


def generate_jwt_token(admin):
    payload = {
        "id": admin.id,
        "email": admin.email,
        "name": admin.name,
        "mobile": admin.mobile,
        "exp": datetime.utcnow() + timedelta(hours=8)

    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')


def generate_jwt_token_for_maintainer():
    payload = {
        "id": 0,
        "email": "maintainer",
        "name": "Maintainer Super Admin",
        "exp": datetime.utcnow() + timedelta(hours=8),
        "role": "maintainer"
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token if isinstance(token, str) else token.decode('utf-8')

@admin_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    admin_id = data.get("admin_id")
    otp = data.get("otp")

    admin = Admin.query.get(admin_id)
    if not admin or not admin.otp or not admin.otp_expiry:
        return jsonify({"message": "Invalid OTP session"}), 400

    if admin.otp != otp:
        return jsonify({"message": "Incorrect OTP"}), 401

    if datetime.utcnow() > admin.otp_expiry:
        return jsonify({"message": "OTP expired"}), 403

    # OTP is valid
    token = generate_jwt_token(admin)
    
    # Clear OTP
    admin.otp = None
    admin.otp_expiry = None
    db.session.commit()

    return jsonify({
        "token": token,
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "mobile": admin.mobile,
        }
    }), 200

@admin_bp.route('/forgot-password/send-otp', methods=['POST'])
def send_admin_otp():
    try:
        # 1. Get email from request
        email = request.json.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # 2. Validate if email exists in Engineer table
        admin = Admin.query.filter_by(email=email).first()
        if not admin:
            return jsonify({"error": "You are not a registered user"}), 404

        # 3. Generate a secure 6-digit OTP
        otp = f"{random.randint(0, 999999):06d}"
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        # 4. Store or update OTP in OTPModel
        existing_otp = OTPModel.query.filter_by(email=email).first()
        if existing_otp:
            existing_otp.otp = otp
            existing_otp.expires_at = expires_at
        else:
            new_otp = OTPModel(email=email, otp=otp, expires_at=expires_at)
            db.session.add(new_otp)

        db.session.commit()

        # 5. Send OTP via email
        email_sent = send_otp_email(email, otp)  # Make sure this function returns True/False

        if email_sent:
            return jsonify({"message": "OTP sent to your email"}), 200
        else:
            return jsonify({"error": "Failed to send OTP email"}), 500

    except Exception as e:
        print(f"Error in send_otp route: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
    
@admin_bp.route('/forgot-password/verify-otp', methods=['POST'])
def verify_admin_otp():
    data = request.json or {}
    email = data.get('email')
    otp_input = data.get('otp')

    if not email or not otp_input:
        return jsonify({"error": "Email and OTP required"}), 400

    record = OTPModel.query.filter_by(email=email).first()
    if not record:
        return jsonify({"error": "OTP not found"}), 404

    now = datetime.utcnow()
    if now > record.expires_at:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"error": "OTP expired"}), 403

    if otp_input != record.otp:
        return jsonify({"error": "Invalid OTP"}), 401

    db.session.delete(record)
    db.session.commit()

    # Create a temp reset token, so user can securely reset password
    token = record.generate_reset_token()
    return jsonify({"message": "OTP verified", "resetToken": token}), 200


@admin_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json or {}
        email = data.get('email')
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')

        if not email or not reset_token or not new_password:
            return jsonify({"error": "Email, reset token, and new password required"}), 400

        # 1. Verify token
        serializer = get_serializer()
        try:
            token_email = serializer.loads(reset_token, max_age=300)  # Token expires after 5 minutes
        except SignatureExpired:
            return jsonify({"error": "Reset token has expired"}), 403
        except BadSignature:
            return jsonify({"error": "Invalid reset token"}), 401

        # 2. Confirm email matches token
        if token_email != email:
            return jsonify({"error": "Token does not match email"}), 401

        # 3. Find the engineer and update password
        admin = Admin.query.filter_by(email=email).first()
        if not admin:
            return jsonify({"error": "Engineer not found"}), 404

        admin.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        print(f"Error in reset_password: {e}")
        return jsonify({"error": "Internal server error"}), 500
