import math
import os
import random
from flask import Blueprint, app, request, jsonify, current_app, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from app.models import LoginAttempt,SupportType,SRQuotaUsage,AdditionalTicketBundle
from app import db
from app.models import Engineer
from app.models import Customer
from app.models import Ticket
from app.models import Comment,CompanySupport
from datetime import datetime, timedelta, timezone
import pytz
import jwt
from flask_cors import cross_origin
from app.models import OTPModel
from app.utils.email_utils import send_ft_customer_notification_email, send_otp_email, send_sr_customer_notification_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import send_from_directory
from app.utils.email_utils import send_comment_notification_to_requester
from zoneinfo import ZoneInfo
from sqlalchemy import func


engineer_bp = Blueprint('engineer', __name__, url_prefix='/api/engineer')


def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")

@engineer_bp.route('', methods=['POST'])  # Fixed: removed duplicate /api/engineers
@cross_origin()
def create_engineer():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'email', 'designation', 'mobile', 'password', 'confirmPassword']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'All fields are required'}), 400

        # Check if passwords match
        if data['password'] != data['confirmPassword']:
            return jsonify({'error': 'Passwords do not match'}), 400

        # Check password length
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400

        # Check if email already exists
        existing_engineer = Engineer.query.filter_by(email=data['email']).first()
        if existing_engineer:
            return jsonify({'error': 'Engineer with this email already exists'}), 409

        # Create new engineer
        new_engineer = Engineer(
            name=data['name'],
            email=data['email'],
            designation=data['designation'],
            mobile=data['mobile'],
            password=generate_password_hash(data['password'])
        )

        db.session.add(new_engineer)
        db.session.commit()

        # Return created engineer data (without password)
        engineer_data = {
            'id': new_engineer.id,
            'name': new_engineer.name,
            'email': new_engineer.email,
            'designation': new_engineer.designation,
            'mobile': new_engineer.mobile
        }

        return jsonify({
            'message': 'Engineer created successfully',
            'engineer': engineer_data
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@engineer_bp.route('', methods=['GET'])  # Fixed: removed duplicate /api/engineers
@cross_origin()
def get_all_engineers():
    try:
        engineers = Engineer.query.all()
        engineers_list = [{
            'id': eng.id,
            'name': eng.name,
            'email': eng.email,
            'designation': eng.designation,
            'mobile': eng.mobile
        } for eng in engineers]

        return jsonify({'engineers': engineers_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@engineer_bp.route('/<int:engineer_id>', methods=['DELETE'])  # Fixed: parameter name and path
@cross_origin()
def delete_engineer(engineer_id):  # Fixed: parameter name matches route
    try:
        engineer = Engineer.query.get(engineer_id)
        if not engineer:
            return jsonify({'error': 'Engineer not found'}), 404

        db.session.delete(engineer)
        db.session.commit()

        return jsonify({'message': 'Engineer deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




@engineer_bp.route("/login", methods=["POST"])
def eng_login():
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
    eng = Engineer.query.filter_by(email=email).first()
    if eng and eng.check_password(password):
        if attempt:
            db.session.delete(attempt)
        token = generate_jwt_token(eng)
        db.session.commit()
        return jsonify({
            "token": token,
            "eng": {
                "id": eng.id,
                "name": eng.name,
                "email": eng.email,
                "mobile": eng.mobile,
                "designation": eng.designation,
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



def generate_jwt_token(eng):
    payload = {
        "id": eng.id,
        "email": eng.email,
        "name": eng.name,
        "designation": eng.designation,
        "mobile": eng.mobile,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')


@engineer_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_engineer_ticket_details(ticket_id):
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
    comments_data = []
    for c in comments:
        comment_dict = {
            "id": c.id,
            "author": c.author_name,
            "timestamp": c.timestamp.isoformat(),
            "content": c.message,
            "role": c.author_role,
        }

        if c.attachment_path:
            # Assuming you have an endpoint 'customer_bp.get_profile_image' or similar to serve files
            attachment_url = url_for('customer.get_cus_profile_image', filename=c.attachment_path, _external=True)
            comment_dict["attachment_url"] = attachment_url
            comment_dict["attachment_type"] = c.attachment_type

        comments_data.append(comment_dict)

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


@engineer_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
def eng_add_ticket_comment(ticket_id):
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

    engineer_name = decoded.get("name", "Engineer")
    engineer_email = decoded.get("email")

    ticket = Ticket.query.filter(Ticket.id == ticket_id).first()
    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    data = request.get_json()
    content = data.get('content', '').strip()
    file = request.files.get('attachment')

    if not content:
        return jsonify({"error": "Comment content is required"}), 400

    attachment_path = None
    attachment_type = None

    # Handle file upload
    if file:
        filename = secure_filename(file.filename)
        mimetype = file.content_type

        if not filename:
            return jsonify({"error": "Invalid file name"}), 400

        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        os.makedirs(upload_folder, exist_ok=True)

        # Save file with timestamp prefix to avoid overwrites
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)

        attachment_path = safe_filename
        attachment_type = 'image' if mimetype and 'image' in mimetype else 'document'

    # Require at least content or a file
    if not content and not file:
        return jsonify({"error": "Content or file is required"}), 400

    try:
        comment = Comment(
            ticket_id=ticket_id,
            author_name=engineer_name,
            author_role='Engineer',
            message=content,
            timestamp=datetime.now(pytz.timezone('Asia/Colombo')),
            attachment_path=attachment_path,
            attachment_type=attachment_type
        )

        db.session.add(comment)
        db.session.commit()

        # 🔔 Send email to requester
        # ✅ Print ticket requester email fields before sending
        print("DEBUG: Sending email to requester")
        print(" - Email:", ticket.requester_email)
        print(" - Name:", ticket.requester_name)
        print(" - Ticket ID:", ticket.id)
        print(" - Subject:", ticket.subject)
        email_sent = send_comment_notification_to_requester(
            requester_email=ticket.requester_email,
            requester_name=ticket.requester_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            comment_content=content,
            cc_email=engineer_email
        )
        print("DEBUG: Email sent status:", email_sent)

        return jsonify({
            "id": comment.id,
            "author": comment.author_name,
            "timestamp": comment.timestamp.isoformat(),
            "content": comment.message,
            "role": comment.author_role,
            "attachment_url": f"/uploads/{attachment_path}" if attachment_path else None,
            "attachment_type": attachment_type
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create comment: {e}")
        return jsonify({"error": "Failed to create comment"}), 500
    
@engineer_bp.route('/ontickets/<int:ticket_id>', methods=['GET'])
def get_engineer_onticket_details(ticket_id):
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
    comments_data = []
    for c in comments:
        comment_dict = {
            "id": c.id,
            "author": c.author_name,
            "timestamp": c.timestamp.isoformat(),
            "content": c.message,
            "role": c.author_role,
        }

        if c.attachment_path:
            # Assuming you have an endpoint 'customer_bp.get_profile_image' or similar to serve files
            attachment_url = url_for('customer.get_cus_profile_image', filename=c.attachment_path, _external=True)
            comment_dict["attachment_url"] = attachment_url
            comment_dict["attachment_type"] = c.attachment_type

        comments_data.append(comment_dict)

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
        "status": ticket.status,
        "assigned_at": ticket.assigned_at.isoformat() if ticket.assigned_at else None,
        "documents": [ticket.documents] if ticket.documents else []
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })


@engineer_bp.route('/ontickets/<int:ticket_id>/comments', methods=['POST'])
def eng_add_onticket_comment(ticket_id):
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

    engineer_name = decoded.get("name", "Engineer")
    engineer_email = decoded.get("email")

    ticket = Ticket.query.filter(Ticket.id == ticket_id).first()
    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    data = request.get_json()
    content = data.get('content', '').strip()
    file = request.files.get('attachment')

    if not content:
        return jsonify({"error": "Comment content is required"}), 400
    
    attachment_path = None
    attachment_type = None

    # Handle file upload
    if file:
        filename = secure_filename(file.filename)
        mimetype = file.content_type

        if not filename:
            return jsonify({"error": "Invalid file name"}), 400

        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        os.makedirs(upload_folder, exist_ok=True)

        # Save file with timestamp prefix to avoid overwrites
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)

        attachment_path = safe_filename
        attachment_type = 'image' if mimetype and 'image' in mimetype else 'document'

    # Require at least content or a file
    if not content and not file:
        return jsonify({"error": "Content or file is required"}), 400

    try:
        comment = Comment(
            ticket_id=ticket_id,
            author_name=engineer_name,
            author_role='Engineer',
            message=content,
            timestamp=datetime.now(pytz.timezone('Asia/Colombo')),
            attachment_path=attachment_path,
            attachment_type=attachment_type
        )

        db.session.add(comment)
        db.session.commit()

        # 🔔 Send email to requester
        # ✅ Print ticket requester email fields before sending
        print("DEBUG: Sending email to requester")
        print(" - Email:", ticket.requester_email)
        print(" - Name:", ticket.requester_name)
        print(" - Ticket ID:", ticket.id)
        print(" - Subject:", ticket.subject)
        email_sent = send_comment_notification_to_requester(
            requester_email=ticket.requester_email,
            requester_name=ticket.requester_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            comment_content=content,
            cc_email=engineer_email
        )
        print("DEBUG: Email sent status:", email_sent)

        return jsonify({
            "id": comment.id,
            "author": comment.author_name,
            "timestamp": comment.timestamp.isoformat(),
            "content": comment.message,
            "role": comment.author_role,
            "attachment_url": f"/uploads/{attachment_path}" if attachment_path else None,
            "attachment_type": attachment_type
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating comment: {e}")
        return jsonify({"error": "Failed to create comment"}), 500
    
    
@engineer_bp.route('/closetickets/<int:ticket_id>', methods=['GET'])
def get_engineer_closeticket_details(ticket_id):
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
    comments_data = []
    for c in comments:
        comment_dict = {
            "id": c.id,
            "author": c.author_name,
            "timestamp": c.timestamp.isoformat(),
            "content": c.message,
            "role": c.author_role,
        }

        if c.attachment_path:
            # Assuming you have an endpoint 'customer_bp.get_profile_image' or similar to serve files
            attachment_url = url_for('customer.get_cus_profile_image', filename=c.attachment_path, _external=True)
            comment_dict["attachment_url"] = attachment_url
            comment_dict["attachment_type"] = c.attachment_type

        comments_data.append(comment_dict)

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


@engineer_bp.route('/closetickets/<int:ticket_id>/comments', methods=['POST'])
def eng_add_closeticket_comment(ticket_id):
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

    engineer_name = decoded.get("name", "Engineer")  # Get customer name from token
    engineer_email = decoded.get("email")

    # Verify ticket exists and belongs to this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    data = request.get_json()
    content = data.get('content', '').strip()
    file = request.files.get('attachment')
    
    if not content:
        return jsonify({"error": "Comment content is required"}), 400
    
    

    attachment_path = None
    attachment_type = None

    # Handle file upload
    if file:
        filename = secure_filename(file.filename)
        mimetype = file.content_type

        if not filename:
            return jsonify({"error": "Invalid file name"}), 400

        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        os.makedirs(upload_folder, exist_ok=True)

        # Save file with timestamp prefix to avoid overwrites
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)

        attachment_path = safe_filename
        attachment_type = 'image' if mimetype and 'image' in mimetype else 'document'

    # Require at least content or a file
    if not content and not file:
        return jsonify({"error": "Content or file is required"}), 400

    try:
        # Create new comment
        comment = Comment(
            ticket_id=ticket_id,
            author_name=engineer_name,
            author_role='Engineer',
            message=content,
            timestamp=datetime.now(pytz.timezone('Asia/Colombo')),
            attachment_path=attachment_path,
            attachment_type=attachment_type
        )
        
        db.session.add(comment)
        db.session.commit()

        # Return the created comment
        new_comment = {
            "id": comment.id,
            "author": comment.author_name,
            "timestamp": comment.timestamp.isoformat(),
            "content": comment.message,
            "role": comment.author_role,
            "attachment_url": f"/uploads/{attachment_path}" if attachment_path else None,
            "attachment_type": attachment_type
        }

        return jsonify(new_comment), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating comment: {e}")  # Add this line
        return jsonify({"error": "Failed to create comment"}), 500
    

@engineer_bp.route('/customers/grouped', methods=['GET', 'OPTIONS'])
def get_grouped_customers():
    try:
        customers = Customer.query.all()

        grouped_data = {}
        for customer in customers:
            company = customer.company or "Unknown"
            if company not in grouped_data:
                grouped_data[company] = []

            grouped_data[company].append({
                "name": customer.name,
                "designation": customer.designation,
                "mobile": customer.mobile,
                "email": customer.email
            })

        return jsonify(grouped_data), 200

    except Exception as e:
        print(f"Error fetching grouped customers: {e}")
        return jsonify({"error": "Internal server error"}), 500


@engineer_bp.route('/forgot-password/send-otp', methods=['POST'])
def send_otp():
    try:
        # 1. Get email from request
        email = request.json.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # 2. Validate if email exists in Engineer table
        engineer = Engineer.query.filter_by(email=email).first()
        if not engineer:
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
    
    
@engineer_bp.route('/forgot-password/verify-otp', methods=['POST'])
def verify_otp():
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


@engineer_bp.route('/reset-password', methods=['POST'])
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
        engineer = Engineer.query.filter_by(email=email).first()
        if not engineer:
            return jsonify({"error": "Engineer not found"}), 404

        engineer.password = generate_password_hash(new_password)
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
        print("Engineer ID from token:", user_id)
        return user_id, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

@engineer_bp.route('/profile', methods=['PUT'])
def update_profile():
    engineer_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    engineer = Engineer.query.get(engineer_id)
    if not engineer:
        return jsonify({"error": "Engineer not found"}), 404

    try:
        data = request.form
        name = data.get("name")
        mobile = data.get("mobilep")
        designation = data.get("designation")

        if not name or not mobile or not designation:
            return jsonify({"error": "Missing required fields"}), 400

        # Update basic profile fields
        engineer.name = name
        engineer.mobile = mobile
        engineer.designation = designation

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
                unique_filename = f"{engineer.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
                
                # Remove old profile image if exists
                if engineer.profile_image:
                    old_file_path = os.path.join(upload_folder, engineer.profile_image)
                    if os.path.exists(old_file_path):
                        try:
                            os.remove(old_file_path)
                        except OSError:
                            pass  # Continue even if old file deletion fails
                
                # Save new file
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Update database with filename
                engineer.profile_image = unique_filename

        db.session.commit()
        
        # Return updated profile data
        profile_image_url = None
        if engineer.profile_image:
            profile_image_url = f"/api/engineer/profile-image/{engineer.profile_image}"
        
        return jsonify({
            "message": "Profile updated successfully",
            "profile": {
                "id": engineer.id,
                "name": engineer.name,
                "email": engineer.email,
                "mobile": engineer.mobile,
                "designation": engineer.designation,
                "profile_image": profile_image_url
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500


@engineer_bp.route('/profile-image/<filename>', methods=['GET'])
def get_profile_image(filename):
    """Serve profile images"""
    try:
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print(f"Error serving profile image: {e}")
        return jsonify({"error": "Image not found"}), 404


# Update the get_profile route as well
@engineer_bp.route('/profile', methods=['GET'])
def get_profile():
    engineer_id, error_response, status = get_user_id_from_token()
    print("Engineer ID from token:", engineer_id)

    if error_response:
        print("Error in token:", error_response)
        return error_response, status

    engineer = Engineer.query.get(engineer_id)
    print("Engineer query result:", engineer)
    if not engineer:
        return jsonify({"error": "Engineer not found"}), 404

    # Generate full URL for profile image
    profile_image_url = None
    if engineer.profile_image:
        profile_image_url = f"/api/engineer/profile-image/{engineer.profile_image}"

    return jsonify({
        "id": engineer.id,
        "name": engineer.name,
        "email": engineer.email,
        "mobile": engineer.mobile,
        "designation": engineer.designation,
        "profile_image": profile_image_url
    })


@engineer_bp.route('/change-password', methods=['POST'])
def change_password():
    engineer_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    engineer = Engineer.query.get(engineer_id)
    if not engineer:
        return jsonify({"error": "Engineer not found"}), 404

    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Missing passwords"}), 400

    if not engineer.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 401

    import re
    if (len(new_password) < 8 or
        not re.search(r'[A-Z]', new_password) or
        not re.search(r'[a-z]', new_password) or
        not re.search(r'[0-9]', new_password) or
        not re.search(r'[!@#$%^&*]', new_password)):
        return jsonify({"error": "New password does not meet complexity requirements"}), 400

    engineer.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})


@engineer_bp.route('/ontickets/<int:ticket_id>/reassign', methods=['POST'])
def reassign_ticket(ticket_id):
    from app.utils.email_utils import send_reassignment_email_to_engineer, notify_requester_about_reassignment

    # JWT Auth
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

    current_engineer_name = decoded.get("name")
    data = request.get_json()
    new_engineer_name = data.get("engineer_name")

    if not new_engineer_name:
        return jsonify({"error": "New engineer name is required"}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if ticket.engineer_name != current_engineer_name:
        return jsonify({"error": "Only the currently assigned engineer can reassign this ticket"}), 403

    if ticket.engineer_name == new_engineer_name:
        return jsonify({"error": "Cannot reassign to the same engineer"}), 400

    new_engineer = Engineer.query.filter_by(name=new_engineer_name).first()
    if not new_engineer:
        return jsonify({"error": "Selected engineer not found"}), 404

    ticket.engineer_name = new_engineer.name
    ticket.engineer_contact = new_engineer.mobile
    db.session.commit()

    print("[DEBUG] Ticket reassignment successful in DB.")
    print(f"[DEBUG] New Engineer: {new_engineer.name}, Email: {new_engineer.email}")

    # Send reassignment email to new engineer
    try:
        print("[DEBUG] Sending reassignment email to new engineer...")
        success_eng = send_reassignment_email_to_engineer(
            engineer_email=new_engineer.email,
            engineer_name=new_engineer.name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            description=ticket.description,
            assigned_by=current_engineer_name
        )
        print("[DEBUG] Email sent to engineer:", success_eng)
    except Exception as e:
        print("[ERROR] Failed to send email to new engineer:", str(e))

    # Notify requester
    try:
        print("[DEBUG] Notifying requester about reassignment...")
        success_req = notify_requester_about_reassignment(
            user_email=ticket.requester_email,
            user_name=ticket.requester_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            new_engineer_name=new_engineer.name,
            new_engineer_email=new_engineer.email
        )
        print("[DEBUG] Email sent to requester:", success_req)
    except Exception as e:
        print("[ERROR] Failed to send email to requester:", str(e))

    return jsonify({
        "message": f"Ticket reassigned to {new_engineer.name} successfully"
    }), 200

@engineer_bp.route('/all', methods=['GET'])
def get_all_engineers_names():
    engineers = Engineer.query.all()
    return jsonify([{"name": eng.name} for eng in engineers]), 200


# Get all companies
@engineer_bp.route('/companies', methods=['GET'])
def get_companies():
    companies = CompanySupport.query.all()
    return jsonify([{"label": c.company, "value": c.company} for c in companies]), 200

# Get customers for a selected company
@engineer_bp.route('/customers/<company>', methods=['GET'])
def get_customers_by_company(company):
    customers = Customer.query.filter_by(company=company).all()
    return jsonify([
        {
            "id": c.id,
            "label": c.name,
            "value": c.name,
            "email": c.email,
            "designation": c.designation,
            "mobile": c.mobile
        }
        for c in customers
    ]), 200

@engineer_bp.route('/me', methods=['GET'])
def get_engineer_info():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    engineer_email = payload.get("email")
    if not engineer_email:
        return jsonify({"error": "Email missing from token"}), 400

    engineer = Engineer.query.filter_by(email=engineer_email).first()
    if not engineer:
        return jsonify({"error": "Engineer not found"}), 404

    return jsonify({
        "name": engineer.name,
        "contact": engineer.mobile
    }), 200


@engineer_bp.route('/create-sr', methods=['POST'])
def create_service_request_by_engineer():
    try:
        # JWT check (engineer)
        auth_header = request.headers.get("Authorization", None)
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401

        token = parts[1]
        try:
            decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        engineer_email = decoded.get("email")

        # Extract form data
        data = request.form
        uploaded_file = request.files.get('document')

        required_fields = ['requester_company', 'requester_name', 'requester_email',
                           'requester_contact', 'subject', 'description', 'priority',
                           'engineer_name', 'engineer_contact']
        if not all(data.get(f) for f in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        company = data.get("requester_company")
        company_support = CompanySupport.query.filter_by(company=company).first()
        if not company_support or not company_support.support_type:
            return jsonify({'error': 'Support type for this company is not configured.'}), 400
        
        user_company = company
        # Company support info
        company_support = CompanySupport.query.filter_by(company=user_company).first()
        if not company_support:
            return jsonify({'error': 'Support type for this company is not configured.'}), 400

        support_type = SupportType.query.filter_by(name=company_support.support_type).first()
        if not support_type:
            return jsonify({'error': 'Invalid support type configured for company.'}), 400

        base_ticket_limit = support_type.ticket_limit
        current_month = datetime.utcnow().strftime('%Y-%m')
        first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Count used service requests this month
        monthly_ticket_count = db.session.query(func.count()).filter(
            Ticket.requester_company == user_company,
            Ticket.created_at >= first_day_of_month,
            Ticket.type == "Service Request"
        ).scalar()

        # Fetch additional bundle
        # Bundle tickets
        manual_bundles = db.session.query(func.sum(AdditionalTicketBundle.additional_tickets)).filter_by(
            company=user_company, month=current_month, source="manual"
        ).scalar() or 0

        carry_bundles = db.session.query(func.sum(AdditionalTicketBundle.additional_tickets)).filter_by(
            company=user_company, month=current_month, source="carry"
        ).scalar() or 0

        # Check if extra was used
        quota_usage = SRQuotaUsage.query.filter_by(
            company=user_company,
            month=current_month
        ).first()
        extra_granted = 1 if quota_usage and quota_usage.used_extra else 0

        total_allowed_tickets = base_ticket_limit + manual_bundles + carry_bundles + extra_granted

        print("==== Quota Check Debug ====")
        print(f"Company: {user_company}")
        print(f"Base Limit: {base_ticket_limit}")
        print(f"Manual Tickets: {manual_bundles}")
        print(f"Carry-forward: {carry_bundles}")
        print(f"Used Extra Before: {extra_granted}")
        print(f"Used This Month: {monthly_ticket_count}")
        print(f"Total Allowed: {total_allowed_tickets}")
        print("===========================")

        if monthly_ticket_count >= total_allowed_tickets:
            # Already used all quotas including extra
            if quota_usage and quota_usage.used_extra:
                return jsonify({
                    "error": "Your monthly SR quota including purchased bundles is exhausted, and your one-time extra SR has already been used. Contact Lanakacom Presales via 0912250764 to purchase more ticket bundles."
                }), 403

            # Create quota usage entry if not exists
            if not quota_usage:
                quota_usage = SRQuotaUsage(company=user_company, month=current_month, used_extra=False)
                db.session.add(quota_usage)
                db.session.commit()

            # Client must confirm override
            if data.get("override") != "true":
                return jsonify({
                    "warning": "Your monthly SR quota is exhausted. You are allowed to submit ONE extra SR for this month. After this, you must purchase extra ticket bundles. Contact Lanakacom Presales via 0912250764.",
                    "allow_override": True
                }), 409

        # Create the ticket
        ticket = Ticket(
            subject=data.get('subject'),
            type="Service Request",
            description=data.get('description'),
            priority=data.get('priority'),
            requester_name=data.get('requester_name'),
            requester_company=company,
            requester_email=data.get('requester_email'),
            requester_contact=data.get('requester_contact'),
            created_at = datetime.now(ZoneInfo("Asia/Colombo")),
            status="Ongoing",
            engineer_name=data.get('engineer_name'),
            engineer_contact=data.get('engineer_contact')
        )

        # Save document if present
        if uploaded_file:
            upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
            os.makedirs(upload_dir, exist_ok=True)

            filename = secure_filename(uploaded_file.filename)
            file_path = os.path.join(upload_dir, filename)
            uploaded_file.save(file_path)
            ticket.documents = f"uploads/{filename}"

        db.session.add(ticket)
        
        if monthly_ticket_count >= (base_ticket_limit + manual_bundles + carry_bundles):
            if not quota_usage:
                quota_usage = SRQuotaUsage(company=user_company, month=current_month, used_extra=True)
                db.session.add(quota_usage)
            else:
                quota_usage.used_extra = True
                
        db.session.commit()
        
        try:
            send_sr_customer_notification_email(
                customer_email=ticket.requester_email,
                customer_name=ticket.requester_name,
                ticket_id=ticket.id,
                subject=ticket.subject,
                priority=ticket.priority,
                description=ticket.description,
                status=ticket.status,
                engineer_name=ticket.engineer_name,
                engineer_contact=ticket.engineer_contact,
            )
        except Exception as e:
            print(f"Failed to send email notification: {str(e)}")

        return jsonify({'message': 'Service Request created successfully.'}), 201

    except Exception as e:
        print("Error in engineer SR route:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


@engineer_bp.route("/ft", methods=["POST"])
def create_faulty_ticket():
    try:
        secret = current_app.config["SECRET_KEY"]
        auth_header = request.headers.get("Authorization", None)
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401

        token = parts[1]
        try:
            decoded = jwt.decode(token, secret, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Engineer info from token
        engineer_name = decoded.get("name")
        engineer_contact = decoded.get("mobile")

        data = request.form
        uploaded_file = request.files.get("document")

        required_fields = [
            "subject",
            "description",
            "priority",
            "requester_name",
            "requester_email",
            "requester_company",
            "requester_contact",
        ]
        if not all(data.get(field) for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        ticket = Ticket(
            subject=data.get("subject"),
            type="Faulty Ticket",
            description=data.get("description"),
            priority=data.get("priority"),
            requester_name=data.get("requester_name"),
            requester_email=data.get("requester_email"),
            requester_company=data.get("requester_company"),
            requester_contact=data.get("requester_contact"),
            created_at = datetime.now(ZoneInfo("Asia/Colombo")),
            status="Ongoing",
            engineer_name=engineer_name,
            engineer_contact=engineer_contact,
            documents=None,
        )

        if uploaded_file:
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            filename = uploaded_file.filename
            filepath = os.path.join(upload_dir, filename)
            uploaded_file.save(filepath)
            ticket.documents = filepath

        db.session.add(ticket)
        db.session.commit()
        
        try:
            send_ft_customer_notification_email(
                customer_email=ticket.requester_email,
                customer_name=ticket.requester_name,
                ticket_id=ticket.id,
                subject=ticket.subject,
                description=ticket.description,
                priority=ticket.priority,
                status=ticket.status,
                engineer_name=engineer_name,
                engineer_contact=engineer_contact,
            )
        except Exception as e:
            print(f"Failed to send email notification: {str(e)}")

        # <-- Add this return statement
        return jsonify({"message": "Faulty Ticket Created by Engineer"}), 201

    except Exception as e:
        print(f"Error creating FT by engineer: {str(e)}")
        return jsonify({"error": str(e)}), 500

