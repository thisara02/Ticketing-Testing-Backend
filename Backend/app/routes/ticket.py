from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from datetime import datetime
from app.config import Config
secret = Config.SECRET_KEY
from flask import current_app
import jwt
from app import db
from app.models import Ticket
from flask_jwt_extended import get_jwt
from app.utils.email_utils import send_assignment_notification_email

ticket_bp = Blueprint("ticket", __name__, url_prefix="/api/ticket")

@ticket_bp.route('sr', methods=['POST'])
def create_service_request():
    try:
        # Manual JWT decoding (similar to userinfo endpoint)
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

        # Extract user info from decoded token
        user_name = decoded.get("name")
        user_company = decoded.get("company")
        user_email = decoded.get("email")
        user_mobile = decoded.get("mobile")

        # Validate that we have the required user information
        if not user_name or not user_email:
            return jsonify({'error': 'Invalid token: missing user information'}), 401

        data = request.form
        uploaded_file = request.files.get('document')

        # Validate required fields
        if not data.get('subject') or not data.get('description') or not data.get('priority'):
            return jsonify({'error': 'Missing required fields'}), 400

        ticket = Ticket(
            subject=data.get('subject'),
            type="Service Request",
            description=data.get('description'),
            priority=data.get('priority'),
            requester_name=user_name,
            requester_company=user_company,
            requester_email=user_email,
            requester_contact=user_mobile,
            created_at=datetime.utcnow(),
            status="Pending",
            documents=None,
            engineer_name="",
            engineer_contact=""
        )

        if uploaded_file:
            # Make sure uploads directory exists
            import os
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            upload_path = f"uploads/{uploaded_file.filename}"
            uploaded_file.save(upload_path)
            ticket.documents = upload_path

        db.session.add(ticket)
        db.session.commit()
        
        from app.utils.email_utils import send_sr_confirmation_email
        
        try:
            send_sr_confirmation_email(
                user_email=user_email,
                user_name=user_name,
                ticket_id=ticket.id,
                subject=data.get('subject'),
                description=data.get('description'),
                priority=data.get('priority')
            )
            print(f"Confirmation email sent to {user_email}")
        except Exception as e:
            print(f"Failed to send confirmation email: {str(e)}")

        return jsonify({'message': 'Service Request Created Successfully'}), 201

    except Exception as e:
        print(f"Error creating service request: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    
    
@ticket_bp.route('ft', methods=['POST'])
def create_faulty_ticket():
    try:
        # Manual JWT decoding (similar to userinfo endpoint)
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

        # Extract user info from decoded token
        user_name = decoded.get("name")
        user_company = decoded.get("company")
        user_email = decoded.get("email")
        user_mobile = decoded.get("mobile")

        # Validate that we have the required user information
        if not user_name or not user_email:
            return jsonify({'error': 'Invalid token: missing user information'}), 401

        data = request.form
        uploaded_file = request.files.get('document')

        # Validate required fields
        if not data.get('subject') or not data.get('description') or not data.get('priority'):
            return jsonify({'error': 'Missing required fields'}), 400

        ticket = Ticket(
            subject=data.get('subject'),
            type="Faulty Ticket",
            description=data.get('description'),
            priority=data.get('priority'),
            requester_name=user_name,
            requester_company=user_company,
            requester_email=user_email,
            requester_contact=user_mobile,
            created_at=datetime.utcnow(),
            status="Pending",
            documents=None,
            engineer_name="",
            engineer_contact=""
        )

        if uploaded_file:
            # Make sure uploads directory exists
            import os
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            upload_path = f"uploads/{uploaded_file.filename}"
            uploaded_file.save(upload_path)
            ticket.documents = upload_path

        db.session.add(ticket)
        db.session.commit()
        
        from app.utils.email_utils import send_ft_confirmation_email
        
        try:
            send_ft_confirmation_email(
                user_email=user_email,
                user_name=user_name,
                ticket_id=ticket.id,
                subject=data.get('subject'),
                description=data.get('description'),
                priority=data.get('priority')
            )
            print(f"Confirmation email sent to {user_email}")
        except Exception as e:
            print(f"Failed to send confirmation email: {str(e)}")

        return jsonify({'message': 'Service Request Created Successfully'}), 201

    except Exception as e:
        print(f"Error creating service request: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    
    

@ticket_bp.route('userinfo', methods=['GET'])
def userinfo():
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
        user_info = {
            "name": decoded.get("name"),
            "company": decoded.get("company"),
            "designation": decoded.get("designation"),
            "email": decoded.get("email"),
            "mobile": decoded.get("mobile"),
        }
        return jsonify(user_info)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@ticket_bp.route('pending', methods=['GET'])
def get_pending_tickets():
    try:
        # Manual JWT decoding
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

        user_email = decoded.get("email")

        if not user_email:
            return jsonify({'error': 'Invalid token: missing user information'}), 401

        # Fetch all pending tickets (e.g., for an engineer dashboard)
        pending_tickets = Ticket.query.filter_by(status="Pending").order_by(Ticket.created_at.desc()).all()

        tickets_data = []
        for ticket in pending_tickets:
            tickets_data.append({
                "id": ticket.id,
                "subject": ticket.subject,
                "type": ticket.type,
                "description": ticket.description,
                "priority": ticket.priority,
                "created_at": ticket.created_at.isoformat(),
                "requester_name": ticket.requester_name,
                "requester_company": ticket.requester_company,
                "requester_email": ticket.requester_email,
                "requester_contact": ticket.requester_contact,
            })

        return jsonify(tickets_data), 200

    except Exception as e:
        print(f"Error fetching pending tickets: {str(e)}")
        return jsonify({'error': str(e)}), 500


@ticket_bp.route('assign/<string:ticket_id>', methods=['PUT'])
def assign_ticket(ticket_id):
    try:
        # Manual JWT decoding
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

        engineer_name = decoded.get("name")
        engineer_contact = decoded.get("mobile")  # updated

        if not engineer_name or not engineer_contact:
            return jsonify({"error": "Missing engineer info in token"}), 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        ticket.engineer_name = engineer_name
        ticket.engineer_contact = engineer_contact
        ticket.status = "Ongoing"

        db.session.commit()
        
        send_assignment_notification_email(
            user_email=ticket.requester_email,
            user_name=ticket.requester_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            engineer_name=engineer_name,
            engineer_contact=engineer_contact
        )

        return jsonify({"message": "Ticket assigned successfully"}), 200

    except Exception as e:
        print(f"Error assigning ticket: {str(e)}")
        return jsonify({"error": str(e)}), 500


@ticket_bp.route('/summary', methods=['GET'])
def ticket_summary():
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

        engineer_name = decoded.get("name")
        if not engineer_name:
            return jsonify({"error": "Invalid token: missing engineer name"}), 401

        total_pending = Ticket.query.filter_by(status='Pending').count()
        ongoing_tickets = Ticket.query.filter_by(status='Ongoing', engineer_name=engineer_name).count()

        return jsonify({
            'total_pending_tickets': total_pending,
            'my_ongoing_tickets': ongoing_tickets
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@ticket_bp.route('/assigned', methods=['GET'])
def get_assigned_tickets():
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

        engineer_name = decoded.get("name")
        if not engineer_name:
            return jsonify({'error': 'Invalid token: missing engineer name'}), 401

        tickets = Ticket.query.filter_by(status="Ongoing", engineer_name=engineer_name)\
                              .order_by(Ticket.created_at.desc()).all()

        ticket_data = []
        for ticket in tickets:
            ticket_data.append({
                "id": f"{ticket.id:06d}",
                "subject": ticket.subject,
                "type": ticket.type,
                "description": ticket.description,
                "priority": ticket.priority,
                "status": ticket.status,
                "company": ticket.requester_company,
                "assignedAt": ticket.created_at.isoformat()  # 🔥 FIXED HERE
            })

        return jsonify(ticket_data), 200

    except Exception as e:
        print(f"Error fetching assigned tickets: {str(e)}")
        return jsonify({'error': str(e)}), 500

