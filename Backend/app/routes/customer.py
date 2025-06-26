import math
import os
import random
from flask import Blueprint, request, jsonify, current_app, send_from_directory
import pytz
from app import db
from app.models import Customer
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from app.models import Ticket
from app.models import Comment
from pytz import timezone
from app.models import LoginAttempt
from app.utils.email_utils import send_otp_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.models import OTPModel

customer_bp = Blueprint("customer", __name__, url_prefix="/api/customers")  # Adjust prefix to match frontend

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")

@customer_bp.route("", methods=["POST"])  # POST /api/admin/customers for creating customer
def register_customer():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        designation = data.get("designation")
        mobile = data.get("mobile")
        company = data.get("company")
        password = data.get("password")
        subscription = data.get("subscription", None)

        if not all([name, email, password]):
            return jsonify({"error": "Name, email, and password are required"}), 400

        existing_customer = Customer.query.filter_by(email=email).first()
        if existing_customer:
            return jsonify({"error": "Customer with this email already exists"}), 409

        hashed_password = generate_password_hash(password)
        new_customer = Customer(
            name=name,
            email=email,
            designation=designation,
            mobile=mobile,
            company=company,
            password=hashed_password,
            subscription=subscription
        )

        db.session.add(new_customer)
        db.session.commit()

        # Return created customer data for frontend
        customer_data = {
            "id": new_customer.id,
            "name": new_customer.name,
            "email": new_customer.email,
            "designation": new_customer.designation,
            "mobile": new_customer.mobile,
            "company": new_customer.company,
            "subscription": new_customer.subscription,
        }

        return jsonify({"message": "Customer created successfully!", "customer": customer_data}), 201

    except Exception as e:
        print("Error in register_customer:", e)
        return jsonify({"error": "Internal server error"}), 500


@customer_bp.route("", methods=["GET"])  # GET /api/admin/customers to fetch all
def get_all_customers():
    customers = Customer.query.all()
    customer_list = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "designation": c.designation,
            "mobile": c.mobile,
            "company": c.company,
            "subscription": c.subscription
        }
        for c in customers
    ]
    return jsonify({"customers": customer_list}), 200


@customer_bp.route("/<int:customer_id>", methods=["DELETE"])  # DELETE /api/admin/customers/:id
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted successfully"}), 200


@customer_bp.route("/login", methods=["POST"])
def cus_login():
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
    cus = Customer.query.filter_by(email=email).first()
    if cus and cus.check_password(password):
        if attempt:
            db.session.delete(attempt)
        token = generate_jwt_token(cus)
        db.session.commit()
        return jsonify({
            "token": token,
            "cus": {
                "id": cus.id,
                "name": cus.name,
                "email":cus.email,
                "mobile": cus.mobile,
                "designation": cus.designation,
                "company": cus.company,
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


def generate_jwt_token(cus):
    payload = {
        "id": cus.id,
        "email": cus.email,
        "name": cus.name,
        "company": cus.company,
        "designation": cus.designation,
        "mobile": cus.mobile,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')



@customer_bp.route('/ongoing-tickets', methods=['GET'])
def get_customer_ongoing_tickets():
    try:
        secret = current_app.config['SECRET_KEY']
        token = request.headers.get("Authorization", None)

        if not token:
            return jsonify({"error": "Authorization header missing"}), 401

        parts = token.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401

        token = parts[1]

        try:
            decoded = jwt.decode(token, secret, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        company = decoded.get("company")
        if not company:
            return jsonify({"error": "Invalid token: missing company"}), 401

        tickets = (
            Ticket.query
            .filter_by(requester_company=company, status="Ongoing")
            .order_by(Ticket.created_at.desc())
            .all()
        )

        ticket_list = []
        for ticket in tickets:
            ticket_list.append({
                "id": f"{ticket.id:06d}",
                "ticketType": ticket.type,  # make sure your model uses 'type' or update accordingly
                "ticketCreatedBy": ticket.requester_name,  # adjust attribute name
                "assignedEngineer": ticket.engineer_name,  # adjust attribute name
                "type": ticket.type,       # adjust attribute name
                "description": ticket.description,
                "createdAt": ticket.created_at.isoformat() if ticket.created_at else None,
                "status": ticket.status,
            })

        return jsonify(ticket_list), 200

    except Exception as e:
        print(f"Error fetching ongoing tickets: {str(e)}")
        return jsonify({'error': str(e)}), 500



@customer_bp.route('/tickets', methods=['GET'])
def get_customer_tickets():
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

    company = decoded.get("company")
    if not company:
        return jsonify({"error": "Company not found in token"}), 400

    # Query tickets for this company
    tickets = Ticket.query.filter(Ticket.requester_company == company).all()

    # Separate tickets by status and type
    pending = {"service": [], "faulty": []}
    ongoing = {"service": [], "faulty": []}

    for t in tickets:
        # Normalize status for comparison
        status_lower = (t.status or "").lower()
        type_lower = (t.type or "").lower()

        ticket_data = {
            "id": t.id,
            "subject": t.subject,
            "createdBy": t.requester_name,
            "type": t.type,
            "description": t.description,
            "assignedEngineer": t.engineer_name,
        }

        if "pending" in status_lower:
            if "service" in type_lower:
                pending["service"].append(ticket_data)
            elif "faulty" in type_lower:
                pending["faulty"].append(ticket_data)
        elif "ongoing" in status_lower or "in progress" in status_lower:
            if "service" in type_lower:
                ongoing["service"].append(ticket_data)
            elif "faulty" in type_lower:
                ongoing["faulty"].append(ticket_data)

    return jsonify({
        "pending": pending,
        "ongoing": ongoing
    })


@customer_bp.route('/ticket-counts', methods=['GET'])
def get_ticket_counts():
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
    

    company = decoded.get("company")

    pending_count = Ticket.query.filter_by(requester_company=company, status="Pending").count()
    ongoing_count = Ticket.query.filter_by(requester_company=company, status="Ongoing").count()

    return jsonify({
        "pending": pending_count,
        "ongoing": ongoing_count
    })


@customer_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_customer_ticket_details(ticket_id):
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

    company = decoded.get("company")
    if not company:
        return jsonify({"error": "Company not found in token"}), 400

    # Query the specific ticket for this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
        Ticket.requester_company == company
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
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "status": ticket.status,
        "documents": []  # Add document handling if needed
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })


@customer_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
def add_ticket_comment(ticket_id):
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

    company = decoded.get("company")
    customer_name = decoded.get("name", "Customer")  # Get customer name from token
    
    if not company:
        return jsonify({"error": "Company not found in token"}), 400

    # Verify ticket exists and belongs to this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
        Ticket.requester_company == company
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({"error": "Comment content is required"}), 400

    try:
        # Create new comment
        comment = Comment(
            ticket_id=ticket_id,
            author_name=customer_name,
            author_role='customer',
            message=content,
            timestamp=datetime.now(timezone('Asia/Colombo'))
        )
        
        db.session.add(comment)
        db.session.commit()

        # Return the created comment
        new_comment = {
            "id": comment.id,
            "author": comment.author_name,
            "timestamp": comment.timestamp.isoformat(),
            "content": comment.message,
            "role": comment.author_role
        }

        return jsonify(new_comment), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create comment"}), 500
    
    
@customer_bp.route('/on-tickets/<int:ticket_id>', methods=['GET'])
def get_customer_onticket_details(ticket_id):
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

    company = decoded.get("company")
    if not company:
        return jsonify({"error": "Company not found in token"}), 400

    # Query the specific ticket for this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
        Ticket.requester_company == company
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
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "status": ticket.status,
        "engineer_name":ticket.engineer_name,
        "engineer_contact":ticket.engineer_contact,
        "documents": []  # Add document handling if needed
    }

    return jsonify({
        "ticket": ticket_data,
        "comments": comments_data
    })
    
@customer_bp.route('/on-tickets/<int:ticket_id>/comments', methods=['POST'])
def add_onticket_comment(ticket_id):
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

    company = decoded.get("company")
    customer_name = decoded.get("name", "Customer")  # Get customer name from token
    
    if not company:
        return jsonify({"error": "Company not found in token"}), 400

    # Verify ticket exists and belongs to this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
        Ticket.requester_company == company
    ).first()

    if not ticket:
        return jsonify({"error": "Ticket not found or access denied"}), 404

    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({"error": "Comment content is required"}), 400

    try:
        # Create new comment
        comment = Comment(
            ticket_id=ticket_id,
            author_name=customer_name,
            author_role='Customer',
            message=content,
            timestamp=datetime.now(timezone('Asia/Colombo'))
        )
        
        db.session.add(comment)
        db.session.commit()

        # Return the created comment
        new_comment = {
            "id": comment.id,
            "author": comment.author_name,
            "timestamp": comment.timestamp.isoformat(),
            "content": comment.message,
            "role": comment.author_role
        }

        return jsonify(new_comment), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create comment"}), 500
    
    

@customer_bp.route('/forgot-password/send-otp', methods=['POST'])
def send_cus_otp():
    try:
        # 1. Get email from request
        email = request.json.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # 2. Validate if email exists in Customer table
        customer = Customer.query.filter_by(email=email).first()
        if not customer:
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
    
    
@customer_bp.route('/forgot-password/verify-otp', methods=['POST'])
def verify_cus_otp():
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


@customer_bp.route('/reset-password', methods=['POST'])
def reset_cus_password():
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
        customer = Customer.query.filter_by(email=email).first()
        if not customer:
            return jsonify({"error": "Engineer not found"}), 404

        customer.password = generate_password_hash(new_password)
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
        print("Customer ID from token:", user_id)
        return user_id, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

@customer_bp.route('/profile', methods=['PUT'])
def update_cus_profile():
    customer_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    try:
        data = request.form
        name = data.get("name")
        mobile = data.get("mobilep")
        designation = data.get("designation")
        company = data.get("company")

        if not name or not mobile or not designation or not company:
            return jsonify({"error": "Missing required fields"}), 400

        # Update basic profile fields
        customer.name = name
        customer.mobile = mobile
        customer.designation = designation
        customer.company = company

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
                unique_filename = f"{customer.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
                
                # Remove old profile image if exists
                if customer.profile_image:
                    old_file_path = os.path.join(upload_folder, customer.profile_image)
                    if os.path.exists(old_file_path):
                        try:
                            os.remove(old_file_path)
                        except OSError:
                            pass  # Continue even if old file deletion fails
                
                # Save new file
                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)
                
                # Update database with filename
                customer.profile_image = unique_filename

        db.session.commit()
        
        # Return updated profile data
        profile_image_url = None
        if customer.profile_image:
            profile_image_url = f"/api/customers/profile-image/{customer.profile_image}"
        
        return jsonify({
            "message": "Profile updated successfully",
            "profile": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "mobile": customer.mobile,
                "designation": customer.designation,
                "company": customer.company,
                "profile_image": profile_image_url
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500


@customer_bp.route('/profile-image/<filename>', methods=['GET'])
def get_cus_profile_image(filename):
    """Serve profile images"""
    try:
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profile_images')
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print(f"Error serving profile image: {e}")
        return jsonify({"error": "Image not found"}), 404


# Update the get_profile route as well
@customer_bp.route('/profile', methods=['GET'])
def get_cus_profile():
    customer_id, error_response, status = get_user_id_from_token()
    print("Customer ID from token:", customer_id)

    if error_response:
        print("Error in token:", error_response)
        return error_response, status

    customer = Customer.query.get(customer_id)
    print("Customer query result:", customer)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # Generate full URL for profile image
    profile_image_url = None
    if customer.profile_image:
        profile_image_url = f"/api/customers/profile-image/{customer.profile_image}"

    return jsonify({
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "mobile": customer.mobile,
        "designation": customer.designation,
        "company": customer.company,
        "profile_image": profile_image_url
    })


@customer_bp.route('/change-password', methods=['POST'])
def change_cus_password():
    customer_id, error_response, status = get_user_id_from_token()
    if error_response:
        return error_response, status

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Missing passwords"}), 400

    if not customer.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 401

    import re
    if (len(new_password) < 8 or
        not re.search(r'[A-Z]', new_password) or
        not re.search(r'[a-z]', new_password) or
        not re.search(r'[0-9]', new_password) or
        not re.search(r'[!@#$%^&*]', new_password)):
        return jsonify({"error": "New password does not meet complexity requirements"}), 400

    customer.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})