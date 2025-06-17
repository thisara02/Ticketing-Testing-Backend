from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from datetime import datetime
from app.config import Config
secret = Config.SECRET_KEY
from flask import current_app
import jwt
from app import db
from app.models import Ticket

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
        
        from app.utils.email_utils import send_ticket_confirmation_email
        
        try:
            send_ticket_confirmation_email(
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



