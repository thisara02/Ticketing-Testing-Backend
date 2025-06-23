from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import Engineer
from app.models import Customer
from app.models import Ticket
from app.models import Comment
from datetime import datetime, timedelta
from pytz import timezone
import jwt
from flask_cors import cross_origin

engineer_bp = Blueprint('engineer', __name__, url_prefix='/api/engineer')

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

    # Otherwise, normal DB authentication
    eng = Engineer.query.filter_by(email=email).first()
    if eng and eng.check_password(password):
        token = generate_jwt_token(eng)
        return jsonify({"token": token, "eng": {"id": eng.id, "name": eng.name, "email": eng.email,"mobile": eng.mobile,"designation": eng.designation,}}), 200

    return jsonify({"message": "Invalid email or password"}), 401


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
    comments_data = [{
        "id": c.id,
        "author": c.author_name,
        "timestamp": c.timestamp.isoformat(),
        "content": c.message,
        "role": c.author_role
    } for c in comments]

    ticket_data = {
        "id": f"#{ticket.id:06d}",
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

    customer_name = decoded.get("name", "Customer")  # Get customer name from token

    # Verify ticket exists and belongs to this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
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
            author_role='Engineer',
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
    comments_data = [{
        "id": c.id,
        "author": c.author_name,
        "timestamp": c.timestamp.isoformat(),
        "content": c.message,
        "role": c.author_role
    } for c in comments]

    ticket_data = {
        "id": f"#{ticket.id:06d}",
        "subject": ticket.subject,
        "type": ticket.type,
        "description": ticket.description,
        "requester_name": ticket.requester_name,
        "requester_email": ticket.requester_email,
        "requester_contact": ticket.requester_contact,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        # "engineer_name":ticket.engineer_name,
        # "engineer_contact":ticket.engineer_contact,
        "status": ticket.status,
        "documents": []  # Add document handling if needed
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

    customer_name = decoded.get("name", "Customer")  # Get customer name from token

    # Verify ticket exists and belongs to this company
    ticket = Ticket.query.filter(
        Ticket.id == ticket_id,
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
            author_role='Engineer',
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
