from functools import wraps
import math
import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
import pytz
from app import db
from app.models import LoginAttempt
from app.models import Ticket
from app.models import AccountManager
from app.models import CompanySupport
import jwt
from app.models import Comment
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random
from app.utils.email_utils import send_admin_otp_email
from app.models import OTPModel
from app.utils.email_utils import send_otp_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.models import SRQuotaUsage, AdditionalTicketBundle


accountmanager_bp = Blueprint("accountmanager", __name__, url_prefix="/api/accountmanager")

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")


@accountmanager_bp.route("/register", methods=["POST"])
def register_accountmanager():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")
        password = data.get("password")

        if not all([name, email, mobile, password]):
            return jsonify({"error": "All fields are required"}), 400

        existing_accountmanager = AccountManager.query.filter_by(email=email).first()
        if existing_accountmanager:
            return jsonify({"error": "Account Manager with this email already exists"}), 409

        new_accountmanager = AccountManager(name=name, email=email, mobile=mobile)
        new_accountmanager.set_password(password)

        db.session.add(new_accountmanager)
        db.session.commit()

        return jsonify({"message": "Account Manager created successfully!"}), 201

    except Exception as e:
        print("Error in register_admin:", e)
        return jsonify({"error": "Internal server error"}), 500
    
    
@accountmanager_bp.route("/all", methods=["GET"])
def get_all_accountmanagers():
    accountmanagers = AccountManager.query.all()
    accountmanager_list = [
        {"id": accountmanager.id, "name": accountmanager.name, "email": accountmanager.email, "mobile": accountmanager.mobile}
        for accountmanager in accountmanagers
    ]
    return jsonify(accountmanager_list), 200


@accountmanager_bp.route("/delete/<int:accountmanager_id>", methods=["DELETE"])
def delete_accountmanager(accountmanager_id):
    accountmanager = AccountManager.query.get(accountmanager_id)
    if not accountmanager:
        return jsonify({"error": "Account Manager not found"}), 404

    db.session.delete(accountmanager)
    db.session.commit()
    return jsonify({"message": "Account Manager deleted successfully"}), 200


@accountmanager_bp.route("/login", methods=["POST"])
def accountmanager_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Time setup - Use Sri Lankan time throughout
    tz = pytz.timezone('Asia/Colombo')
    now = datetime.now(tz)  # Current Sri Lankan time
    
    # Convert to naive datetime for database storage (removing timezone info)
    now_naive = now.replace(tzinfo=None)

    MAX_ATTEMPTS = 3
    LOCKOUT_DURATION = timedelta(minutes=5)
    ATTEMPT_WINDOW = timedelta(minutes=15)

    # Fetch previous attempt
    attempt = LoginAttempt.query.filter_by(email=email).first()

    # --- Check if locked ---
    if attempt and attempt.locked_until:
        # Database stores Sri Lankan time as naive datetime
        # Convert back to aware Sri Lankan time for comparison
        locked_until_aware = tz.localize(attempt.locked_until)
        
        if now < locked_until_aware:
            remaining_seconds = (locked_until_aware - now).total_seconds()
            remaining_minutes = math.ceil(remaining_seconds / 60)
            return jsonify({
                "message": f"Account locked. Try again in {remaining_minutes} minutes.",
                "locked_until": attempt.locked_until.strftime("%Y-%m-%d %H:%M:%S") + " (Sri Lanka Time)",
                "current_time": now_naive.strftime("%Y-%m-%d %H:%M:%S") + " (Sri Lanka Time)"
            }), 403

    # --- Authenticate user ---
    am = AccountManager.query.filter_by(email=email).first()
    if am and am.check_password(password):
        if attempt:
            db.session.delete(attempt)
        token = generate_jwt_token(am)
        db.session.commit()
        return jsonify({
            "token": token,
            "am": {
                "id": am.id,
                "name": am.name,
                "email": am.email,
                "mobile": am.mobile,
            }
        }), 200

    # --- Handle failed login ---
    if not attempt:
        # Store Sri Lankan time as naive datetime
        attempt = LoginAttempt(email=email, failed_attempts=1, last_attempt=now_naive)
        db.session.add(attempt)
    else:
        if attempt.last_attempt:
            # Convert stored naive datetime back to aware Sri Lankan time
            last_attempt_aware = tz.localize(attempt.last_attempt)
            
            if (now - last_attempt_aware) > ATTEMPT_WINDOW:
                attempt.failed_attempts = 1
            else:
                attempt.failed_attempts += 1
        else:
            attempt.failed_attempts += 1

        # Update with current Sri Lankan time
        attempt.last_attempt = now_naive

        if attempt.failed_attempts >= MAX_ATTEMPTS:
            # Store lockout time in Sri Lankan time
            lockout_time = now + LOCKOUT_DURATION
            attempt.locked_until = lockout_time.replace(tzinfo=None)

    db.session.commit()

    remaining_attempts = max(0, MAX_ATTEMPTS - attempt.failed_attempts)
    
    response_data = {
        "message": "Invalid email or password",
        "attempts_left": remaining_attempts
    }
    
    # Add timing information in Sri Lankan time
    if attempt and attempt.last_attempt:
        response_data["last_attempt"] = attempt.last_attempt.strftime("%Y-%m-%d %H:%M:%S") + " (Sri Lanka Time)"
    
    if attempt and attempt.locked_until:
        response_data["locked_until"] = attempt.locked_until.strftime("%Y-%m-%d %H:%M:%S") + " (Sri Lanka Time)"
    
    return jsonify(response_data), 401


def generate_jwt_token(am):
    payload = {
        "id": am.id,
        "email": am.email,
        "name": am.name,
        "mobile": am.mobile,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')


@accountmanager_bp.route('/forgot-password/send-otp', methods=['POST'])
def am_send_otp():
    try:
        # 1. Get email from request
        email = request.json.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # 2. Validate if email exists in Account Manager table
        accountmanager = AccountManager.query.filter_by(email=email).first()
        if not accountmanager:
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
    
    
@accountmanager_bp.route('/forgot-password/verify-otp', methods=['POST'])
def am_verify_otp():
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


@accountmanager_bp.route('/reset-password', methods=['POST'])
def am_reset_password():
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
        accountmanager = AccountManager.query.filter_by(email=email).first()
        if not accountmanager:
            return jsonify({"error": "Engineer not found"}), 404

        accountmanager.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        print(f"Error in reset_password: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
    
def get_user_id_from_token():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return None, jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None, jsonify({"error": "Invalid Authorization header format"}), 401

    token = parts[1]
    try:
        decoded = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        print("Decoded JWT payload:", decoded)
        user_id = decoded.get("id")
        print("Account Manager ID from token:", user_id)
        return user_id, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

@accountmanager_bp.route('/profile', methods=['PUT'])
def am_update_profile():
    accountmanager_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    accountmanager = AccountManager.query.get(accountmanager_id)
    if not accountmanager:
        return jsonify({"error": "Account Manager not found"}), 404

    try:
        data = request.form
        name = data.get("name")
        mobile = data.get("mobile")

        if not name or not mobile:
            return jsonify({"error": "Missing required fields"}), 400

        # Update basic profile fields
        accountmanager.name = name
        accountmanager.mobile = mobile

        # Handle profile image upload
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            
            # Check if file is actually selected
            if file and file.filename != '':
                # Validate file type
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
                if not ('.' in file.filename and 
                        file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
                    return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed"}), 400
                
                # Create uploads directory if it doesn't exist
                upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
                os.makedirs(upload_folder, exist_ok=True)
                
                # Generate unique filename to avoid conflicts
                import uuid
                file_extension = file.filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{accountmanager.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
                
                # Remove old profile image if exists
                if accountmanager.profile_image:
                    old_file_path = os.path.join(upload_folder, accountmanager.profile_image)
                    if os.path.exists(old_file_path):
                        try:
                            os.remove(old_file_path)
                        except OSError:
                            pass  # Continue even if old file deletion fails
                
                # Save new file
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Update database with filename
                accountmanager.profile_image = unique_filename

        db.session.commit()
        
        # Return updated profile data
        profile_image_url = None
        if accountmanager.profile_image:
            profile_image_url = f"/api/accountmanager/profile-image/{accountmanager.profile_image}"
        
        return jsonify({
            "message": "Profile updated successfully",
            "profile": {
                "id": accountmanager.id,
                "name": accountmanager.name,
                "email": accountmanager.email,
                "mobile": accountmanager.mobile,
                "profile_image": profile_image_url
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500


@accountmanager_bp.route('/profile-image/<filename>', methods=['GET'])
def am_get_profile_image(filename):
    """Serve profile images"""
    try:
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print(f"Error serving profile image: {e}")
        return jsonify({"error": "Image not found"}), 404


# Update the get_profile route as well
@accountmanager_bp.route('/profile', methods=['GET'])
def am_get_profile():
    accountmanager_id, error_response, status = get_user_id_from_token()
    print("Account Manager ID from token:", accountmanager_id)

    if error_response:
        print("Error in token:", error_response)
        return error_response, status

    accountmanager = AccountManager.query.get(accountmanager_id)
    print("Account Manager query result:", accountmanager)
    if not accountmanager:
        return jsonify({"error": "Account Manager not found"}), 404

    # Generate full URL for profile image
    profile_image_url = None
    if accountmanager.profile_image:
        profile_image_url = f"/api/accountmanager/profile-image/{accountmanager.profile_image}"

    return jsonify({
        "id": accountmanager.id,
        "name": accountmanager.name,
        "email": accountmanager.email,
        "mobile": accountmanager.mobile,
        "profile_image": profile_image_url
    })


@accountmanager_bp.route('/change-password', methods=['POST'])
def am_change_password():
    accountmanager_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    accountmanager = AccountManager.query.get(accountmanager_id)
    if not accountmanager:
        return jsonify({"error": "Account Manager not found"}), 404

    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Missing passwords"}), 400

    if not accountmanager.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 401

    import re
    if (len(new_password) < 8 or
        not re.search(r'[A-Z]', new_password) or
        not re.search(r'[a-z]', new_password) or
        not re.search(r'[0-9]', new_password) or
        not re.search(r'[!@#$%^&*]', new_password)):
        return jsonify({"error": "New password does not meet complexity requirements"}), 400

    accountmanager.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})


@accountmanager_bp.route('customers', methods=['GET', 'OPTIONS'])
def get_account_manager_customers():
    if request.method == 'OPTIONS':
        return '', 200
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid authorization format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        account_manager_name = decoded.get("name")

        if not account_manager_name:
            return jsonify({"error": "Account Manager name not found in token"}), 400

        companies = CompanySupport.query.filter_by(account_manager=account_manager_name).all()

        results = [
            {
                "id": c.id,
                "name": c.company,
                "support_type": c.support_type,
                "location": c.location,
                "contact_person": c.contact_person,
                "contact_mobile": c.contact_mobile,
            }
            for c in companies
        ]

        return jsonify(results), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@accountmanager_bp.route("/tickets", methods=["GET"])
def get_tickets_for_account_manager():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid authorization format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        account_manager_name = decoded.get("name")
        if not account_manager_name:
            return jsonify({"error": "Account Manager name not found in token"}), 400

        # Get all companies managed by this AM
        companies = CompanySupport.query.filter_by(account_manager=account_manager_name).all()
        company_names = [c.company for c in companies]

        if not company_names:
            return jsonify([]), 200  # No companies managed

        # Get all tickets for those companies
        tickets = Ticket.query.filter(Ticket.requester_company.in_(company_names)).all()

        results = [
            {
                "id": t.id,
                "subject": t.subject,
                "type": t.type,
                "priority": t.priority,
                "requester_company": t.requester_company,
                "status": t.status,
                "created_at": t.created_at.strftime("%Y-%m-%d %H:%M"),
                "closed_at": t.closed_at.strftime("%Y-%m-%d %H:%M") if t.closed_at else None,
                "engineer_name": t.engineer_name,
                "engineer_contact":t.engineer_contact,
                "status": t.status,
                "work_done_comment":t.work_done_comment,
                "rectification_date":t.rectification_date.isoformat() if t.rectification_date else None,
            }
            for t in tickets
        ]

        return jsonify(results), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accountmanager_bp.route('/closetickets/<int:ticket_id>', methods=['GET'])
def get_accountmanager_closeticket_details(ticket_id):
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid Authorization header format"}), 401

    token = parts[1]
    try:
        secret = current_app.config['SECRET_KEY']
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # Query the specific ticket for this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    # Get comments for this ticket
    comments = Comment.query.filter(Comment.ticket_id == ticket_id).order_by(Comment.timestamp.asc()).all()
    comments_data = [{
        "id": c.id,
        "author": c.author_name,
        "timestamp": c.timestamp.isoformat(),
        "content": c.message,
        "role": c.author_role
    } for c in comments]

    ticket_data = {
        "id": ticket.id,
        "subject": ticket.subject,
        "type": ticket.type,
        "description": ticket.description,
        "requester_company":ticket.requester_company,
        "requester_name": ticket.requester_name,
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "engineer_name":ticket.engineer_name,
        "engineer_contact":ticket.engineer_contact,
        "status": ticket.status,
        "documents": [ticket.documents] if ticket.documents else [],
        "work_done_comment":ticket.work_done_comment,
        "rectification_date":ticket.rectification_date.isoformat() if ticket.rectification_date else None,
        "closed_at": ticket.closed_at.isoformat() if ticket.closed_at else None,
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })
    
@accountmanager_bp.route('/ontickets/<int:ticket_id>', methods=['GET'])
def get_accountmanager_onticket_details(ticket_id):
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid Authorization header format"}), 401

    token = parts[1]
    try:
        secret = current_app.config['SECRET_KEY']
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # Query the specific ticket for this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    # Get comments for this ticket
    comments = Comment.query.filter(Comment.ticket_id == ticket_id).order_by(Comment.timestamp.asc()).all()
    comments_data = [{
        "id": c.id,
        "author": c.author_name,
        "timestamp": c.timestamp.isoformat(),
        "content": c.message,
        "role": c.author_role
    } for c in comments]

    ticket_data = {
        "id": ticket.id,
        "subject": ticket.subject,
        "type": ticket.type,
        "description": ticket.description,
        "requester_name": ticket.requester_name,
        "requester_company":ticket.requester_company,
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "engineer_name":ticket.engineer_name,
        "engineer_contact":ticket.engineer_contact,
        "assigned_at": ticket.assigned_at.isoformat() if ticket.assigned_at else None,
        "status": ticket.status,
        "documents": [ticket.documents] if ticket.documents else []
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })
    
    
@accountmanager_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_accountmanager_ticket_details(ticket_id):
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid Authorization header format"}), 401

    token = parts[1]
    try:
        secret = current_app.config['SECRET_KEY']
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # Query the specific ticket for this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    # Get comments for this ticket
    comments = Comment.query.filter(Comment.ticket_id == ticket_id).order_by(Comment.timestamp.asc()).all()
    comments_data = [{
        "id": c.id,
        "author": c.author_name,
        "timestamp": c.timestamp.isoformat(),
        "content": c.message,
        "role": c.author_role
    } for c in comments]

    ticket_data = {
        "id": ticket.id,
        "subject": ticket.subject,
        "type": ticket.type,
        "description": ticket.description,
        "requester_company":ticket.requester_company,
        "requester_name": ticket.requester_name,
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "status": ticket.status,
        "documents": [ticket.documents] if ticket.documents else []
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })
    
    
def token_required_am(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401

        token = parts[1]
        try:
            decoded = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.am_id = decoded.get("id")
            request.am_email = decoded.get("email")
            request.am_name = decoded.get("name")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated

@accountmanager_bp.route("/company-details/<string:company_name>", methods=["GET"])
@token_required_am
def get_company_details(company_name):
    try:
        # Find the company info
        company = CompanySupport.query.filter_by(company=company_name).first()
        if not company:
            return jsonify({"error": "Company not found"}), 404

        # ❗️Get only MANUAL bundles (not carry-forwards)
        bundles = AdditionalTicketBundle.query.filter_by(
            company=company_name,
            source="manual"
        ).order_by(AdditionalTicketBundle.month.desc()).all()

        bundle_data = [
            {
                "month": b.month,
                "additional_tickets": b.additional_tickets,
                "added_by": b.added_by,
                "created_at": b.created_at.strftime("%Y-%m-%d %H:%M:%S") if b.created_at else None
            }
            for b in bundles
        ]

        company_data = {
            "name": company.company,
            "location": company.location,
            "contact_person": company.contact_person,
            "contact_mobile": company.contact_mobile,
            "support_type": company.support_type,
            "bundles": bundle_data,
        }

        return jsonify(company_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
