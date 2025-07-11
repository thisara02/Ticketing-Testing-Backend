import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app import db
from app.models import Admin
from app.models import Ticket
from app.models import Comment
from app.models import CompanySupport
from app.models import AccountManager
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random
from app.utils.email_utils import send_admin_otp_email, send_bundle_notification_to_am
from app.models import OTPModel
from app.utils.email_utils import send_otp_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.models import SRQuotaUsage, AdditionalTicketBundle


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
    
    
@admin_bp.route('/company-register', methods=['POST'])
def register_company():
    try:
        data = request.get_json()

        required_fields = ['company', 'location', 'contact_person', 'contact_mobile', 'account_manager', 'support_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if company already exists
        existing = CompanySupport.query.filter_by(company=data['company']).first()
        if existing:
            return jsonify({"error": "Company already exists"}), 409

        # Create new company entry
        company = CompanySupport(
            company=data['company'],
            location=data['location'],
            contact_person=data['contact_person'],
            contact_mobile=data['contact_mobile'],
            account_manager=data['account_manager'],
            support_type=data['support_type']
        )
        db.session.add(company)
        db.session.commit()

        return jsonify({"message": "Company registered successfully"}), 201

    except Exception as e:
        print("Error registering company:", str(e))
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route('/companies', methods=['GET'])
def get_all_companies():
    companies = CompanySupport.query.all()
    result = [{
        "id": c.id,
        "company": c.company,
        "location": c.location,
        "contact_person": c.contact_person,
        "contact_mobile": c.contact_mobile,
        "account_manager": c.account_manager,
        "support_type": c.support_type,
    } for c in companies]
    return jsonify(result), 200


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
        print("Engineer ID from token:", user_id)
        return user_id, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

@admin_bp.route('/profile', methods=['PUT'])
def admin_update_profile():
    admin_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    try:
        data = request.form
        name = data.get("name")
        mobile = data.get("mobilep")
        if not name or not mobile:
            return jsonify({"error": "Missing required fields"}), 400

        # Update basic profile fields
        admin.name = name
        admin.mobile = mobile

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
                unique_filename = f"{admin.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
                
                # Remove old profile image if exists
                if admin.profile_image:
                    old_file_path = os.path.join(upload_folder, admin.profile_image)
                    if os.path.exists(old_file_path):
                        try:
                            os.remove(old_file_path)
                        except OSError:
                            pass  # Continue even if old file deletion fails
                
                # Save new file
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Update database with filename
                admin.profile_image = unique_filename

        db.session.commit()
        
        # Return updated profile data
        profile_image_url = None
        if admin.profile_image:
            profile_image_url = f"/api/admin/profile-image/{admin.profile_image}"
        
        return jsonify({
            "message": "Profile updated successfully",
            "profile": {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "mobile": admin.mobile,
                "profile_image": profile_image_url
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500


@admin_bp.route('/profile-image/<filename>', methods=['GET'])
def get_admin_profile_image(filename):
    """Serve profile images"""
    try:
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print(f"Error serving profile image: {e}")
        return jsonify({"error": "Image not found"}), 404


# Update the get_profile route as well
@admin_bp.route('/profile', methods=['GET'])
def get_add_admin_profile():
    admin_id, error_response, status = get_user_id_from_token()
    print("Admin ID from token:", admin_id)

    if error_response:
        print("Error in token:", error_response)
        return error_response, status

    admin = Admin.query.get(admin_id)
    print("Engineer query result:", admin)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    # Generate full URL for profile image
    profile_image_url = None
    if admin.profile_image:
        profile_image_url = f"/api/admin/profile-image/{admin.profile_image}"

    return jsonify({
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "mobile": admin.mobile,
        "profile_image": profile_image_url
    })


@admin_bp.route('/change-password', methods=['POST'])
def admin_change_password():
    admin_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Missing passwords"}), 400

    if not admin.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 401

    import re
    if (len(new_password) < 8 or
        not re.search(r'[A-Z]', new_password) or
        not re.search(r'[a-z]', new_password) or
        not re.search(r'[0-9]', new_password) or
        not re.search(r'[!@#$%^&*]', new_password)):
        return jsonify({"error": "New password does not meet complexity requirements"}), 400

    admin.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})


@admin_bp.route('/closetickets/<int:ticket_id>', methods=['GET'])
def get_admin_closeticket_details(ticket_id):
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
    
@admin_bp.route('/ontickets/<int:ticket_id>', methods=['GET'])
def get_admin_onticket_details(ticket_id):
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
    
    
@admin_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_admin_ticket_details(ticket_id):
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
    
    
@admin_bp.route('/dashboard/tickets-summary', methods=['GET'])
def admin_dashboard_summary():
    try:
        # Fetch all tickets
        tickets = Ticket.query.all()

        # Categorize tickets
        pending_tickets = [t for t in tickets if t.status == "Pending"]
        ongoing_tickets = [t for t in tickets if t.status == "Ongoing"]
        closed_tickets = [
            t for t in tickets
            if t.status == "Closed" and t.closed_at and
               t.closed_at.month == datetime.utcnow().month and
               t.closed_at.year == datetime.utcnow().year
        ]

        # Engineer stats
        engineer_stats = {}
        for ticket in ongoing_tickets:
            if ticket.engineer_name:
                engineer_stats.setdefault(ticket.engineer_name, {"ongoing": 0, "closed": 0})
                engineer_stats[ticket.engineer_name]["ongoing"] += 1
        for ticket in closed_tickets:
            if ticket.engineer_name:
                engineer_stats.setdefault(ticket.engineer_name, {"ongoing": 0, "closed": 0})
                engineer_stats[ticket.engineer_name]["closed"] += 1

        return jsonify({
            "pending": [
                {
                    "id": t.id,
                    "subject": t.subject,
                    "type": t.type,
                    "requester_name": t.requester_name,
                    "requester_company": t.requester_company,
                    "description": t.description,
                    "created_at": t.created_at.isoformat(),
                } for t in pending_tickets
            ],
            "ongoing": [
                {
                    "id": t.id,
                    "subject": t.subject,
                    "type": t.type,
                    "requester_name": t.requester_name,
                    "requester_company": t.requester_company,
                    "description": t.description,
                    "engineer_name": t.engineer_name,
                    "created_at": t.created_at.isoformat(),
                } for t in ongoing_tickets
            ],
            "engineer_stats": engineer_stats
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
      
@admin_bp.route('/add-bundle', methods=['POST'])
def add_additional_bundle():
    data = request.get_json()
    company = data.get('company')
    month = data.get('month')  # Format: "YYYY-MM"
    tickets = data.get('additional_tickets')

    if not company or not month or not tickets:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # ✅ Step 1: Only update/add bundles with source="manual"
        # ✅ Always create new entry for every admin-added bundle
        bundle = AdditionalTicketBundle(
            company=company,
            month=month,
            additional_tickets=tickets,
            source="manual",
            added_by="Administrator"
        )
        db.session.add(bundle)


        db.session.commit()

        # ✅ Step 2: Lookup account manager from company
        company_record = CompanySupport.query.filter_by(company=company).first()
        if company_record and company_record.account_manager:
            am_name = company_record.account_manager
            account_manager = AccountManager.query.filter_by(name=am_name).first()

            if account_manager:
                # ✅ Step 3: Send email notification
                send_bundle_notification_to_am(
                    am_email=account_manager.email,
                    am_name=account_manager.name,
                    company=company,
                    month=month,
                    tickets=tickets
                )

        return jsonify({'message': f'{tickets} additional tickets added for {company} in {month}'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

