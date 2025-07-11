import os
from zoneinfo import ZoneInfo
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from datetime import datetime
from app.config import Config
secret = Config.SECRET_KEY
from flask import current_app
import jwt
from app import db
from app.models import Ticket
from app.models import Customer
from flask_jwt_extended import get_jwt
from app.utils.email_utils import send_assignment_notification_email
from pytz import timezone
from werkzeug.utils import secure_filename
from app.models import Engineer
from sqlalchemy import func
from app.models import CompanySupport, SupportType
from app.utils.email_utils import send_ticket_closed_email 
from app.models import SRQuotaUsage, AdditionalTicketBundle

ticket_bp = Blueprint("ticket", __name__, url_prefix="/api/ticket")

@ticket_bp.route('/sr', methods=['POST'])
def create_service_request():
    try:
        # JWT Auth
        secret = current_app.config['SECRET_KEY']
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

        user_name = decoded.get("name")
        user_company = decoded.get("company")
        user_email = decoded.get("email")
        user_mobile = decoded.get("mobile")

        if not user_name or not user_email:
            return jsonify({'error': 'Invalid token: missing user information'}), 401

        data = request.form
        uploaded_file = request.files.get('document')

        if not data.get('subject') or not data.get('description') or not data.get('priority'):
            return jsonify({'error': 'Missing required fields'}), 400

        # Support info
        company_support = CompanySupport.query.filter_by(company=user_company).first()
        if not company_support:
            return jsonify({'error': 'Support type for this company is not configured.'}), 400

        support_type = SupportType.query.filter_by(name=company_support.support_type).first()
        if not support_type:
            return jsonify({'error': 'Invalid support type configured for company.'}), 400

        base_ticket_limit = support_type.ticket_limit
        current_month = datetime.utcnow().strftime('%Y-%m')
        first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Used SRs this month
        monthly_ticket_count = db.session.query(func.count()).filter(
            Ticket.requester_company == user_company,
            Ticket.created_at >= first_day_of_month,
            Ticket.type == "Service Request"
        ).scalar()

        # Bundle tickets
        manual_bundles = db.session.query(func.sum(AdditionalTicketBundle.additional_tickets)).filter_by(
            company=user_company, month=current_month, source="manual"
        ).scalar() or 0

        carry_bundles = db.session.query(func.sum(AdditionalTicketBundle.additional_tickets)).filter_by(
            company=user_company, month=current_month, source="carry"
        ).scalar() or 0

        # One-time extra ticket
        quota_usage = SRQuotaUsage.query.filter_by(company=user_company, month=current_month).first()
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
            if quota_usage and quota_usage.used_extra:
                return jsonify({
                    "error": "Your monthly SR quota including purchased bundles is exhausted, and your one-time extra SR has already been used.",
                    "show_add_bundle_prompt": True
                }), 403

            if not quota_usage:
                quota_usage = SRQuotaUsage(company=user_company, month=current_month, used_extra=False)
                db.session.add(quota_usage)
                db.session.commit()

            if data.get("override") != "true":
                return jsonify({
                    "warning": "Your monthly SR quota is exhausted. You are allowed to submit ONE extra SR for this month. After this, you must purchase extra ticket bundles. Contact Lanakacom Presales via 0912250764.",
                    "allow_override": True
                }), 409

        # Ticket creation
        ticket = Ticket(
            subject=data.get('subject'),
            type="Service Request",
            description=data.get('description'),
            priority=data.get('priority'),
            requester_name=user_name,
            requester_company=user_company,
            requester_email=user_email,
            requester_contact=user_mobile,
            created_at=datetime.now(ZoneInfo("Asia/Colombo")),
            status="Pending",
            documents=None,
            engineer_name="",
            engineer_contact=""
        )

        if uploaded_file:
            upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            filename = secure_filename(uploaded_file.filename)
            upload_path = os.path.join(upload_dir, filename)
            uploaded_file.save(upload_path)
            ticket.documents = f"uploads/{filename}"

        db.session.add(ticket)

        if monthly_ticket_count >= (base_ticket_limit + manual_bundles + carry_bundles):
            if not quota_usage:
                quota_usage = SRQuotaUsage(company=user_company, month=current_month, used_extra=True)
                db.session.add(quota_usage)
            else:
                quota_usage.used_extra = True

        db.session.commit()

        # Notifications
        from app.utils.email_utils import send_sr_confirmation_email, notify_new_pending_sr_to_engineer

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

        engineers = Engineer.query.with_entities(Engineer.email).all()
        email_list = [eng.email for eng in engineers if eng.email]

        try:
            notify_new_pending_sr_to_engineer(
                ticket_id=ticket.id,
                subject=data.get('subject'),
                priority=data.get('priority'),
                description=data.get('description'),
                requester_name=user_name,
                requester_company=user_company,
                recipient_emails=email_list
            )
            print("Engineer notified about new pending ticket.")
        except Exception as e:
            print(f"Failed to notify engineer: {str(e)}")

        return jsonify({'message': 'Service Request Created Successfully'}), 201

    except Exception as e:
        print(f"Error creating service request: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@ticket_bp.route('ft', methods=['POST'])
def create_faulty_ticket():
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

        # Extract user info from token
        user_name = decoded.get("name")
        user_company = decoded.get("company")
        user_email = decoded.get("email")
        user_mobile = decoded.get("mobile")

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
            created_at = datetime.now(ZoneInfo("Asia/Colombo")),
            status="Pending",
            documents=None,
            engineer_name="",
            engineer_contact=""
        )

        if uploaded_file:
            import os
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            upload_path = os.path.join(upload_dir, uploaded_file.filename)
            uploaded_file.save(upload_path)
            ticket.documents = upload_path

        db.session.add(ticket)
        db.session.commit()
        
        from app.utils.email_utils import send_ft_confirmation_email, notify_new_pending_ft_to_engineer

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
            
        engineers = Engineer.query.with_entities(Engineer.email).all()
        email_list = [eng.email for eng in engineers if eng.email]

        try:
            notify_new_pending_ft_to_engineer(
                ticket_id=ticket.id,
                subject=data.get('subject'),
                priority=data.get('priority'),
                description=data.get('description'),
                requester_name=user_name,
                requester_company=user_company,
                recipient_emails=email_list
            )
            print("Engineer notified about new pending ticket.")
        except Exception as e:
            print(f"Failed to notify engineer: {str(e)}")

        # ✅ Return success only after all processing
        return jsonify({'message': 'Faulty Ticket Created Successfully'}), 201

    except Exception as e:
        print(f"Error creating faulty ticket: {str(e)}")
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
        engineer_contact = decoded.get("mobile")
        engineer_email = decoded.get("email") # updated

        if not engineer_name or not engineer_contact:
            return jsonify({"error": "Missing engineer info in token"}), 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        ticket.engineer_name = engineer_name
        ticket.engineer_email = engineer_email
        ticket.engineer_contact=engineer_contact
        ticket.status = "Ongoing"
        ticket.assigned_at = datetime.now(ZoneInfo("Asia/Colombo")),

        db.session.commit()
        
        send_assignment_notification_email(
            user_email=ticket.requester_email,
            user_name=ticket.requester_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            engineer_name=engineer_name,
            engineer_email=engineer_email
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

        tickets = Ticket.query.filter_by(status="Ongoing", engineer_name=engineer_name).order_by(Ticket.created_at.desc()).all()

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
    
def calculate_duration_seconds(assigned_at, closed_at):
    if assigned_at and closed_at:
        from pytz import timezone

        sltz = timezone("Asia/Colombo")

        if assigned_at.tzinfo is None:
            assigned_at = sltz.localize(assigned_at)
        else:
            assigned_at = assigned_at.astimezone(sltz)

        closed_at = closed_at.astimezone(sltz)

        return int((closed_at - assigned_at).total_seconds())
    return None


@ticket_bp.route('/close/<int:ticket_id>', methods=['POST'])
def close_ticket(ticket_id):
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

        engineer_name = decoded.get("name")  # ✅ Engineer closing the ticket

        # Get and validate request data
        data = request.get_json()
        rectification_date_str = data.get("rectification_date")
        work_done_comment = data.get("work_done_comment", "").strip()

        if not rectification_date_str or not work_done_comment:
            return jsonify({"error": "All fields are required"}), 400

        try:
            rectification_date = datetime.fromisoformat(rectification_date_str)
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400

        # Fetch the ticket
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        # Update ticket fields
        ticket.rectification_date = rectification_date
        ticket.work_done_comment = work_done_comment
        ticket.status = "Closed"
        ticket.closed_at = datetime.now(timezone("Asia/Colombo"))
        ticket.duration = calculate_duration_seconds(ticket.assigned_at, ticket.closed_at)

        db.session.commit()

        # ✅ Send email using data already in the ticket
        try:
            print("Sending closed ticket email with values:")
            print("To:", ticket.requester_email)
            print("Name:", ticket.requester_name)
            print("Ticket ID:", ticket.id)
            print("Subject:", ticket.subject)
            print("Engineer:", engineer_name)
            print("Rectified on:", rectification_date)
            print("Work done comment:", work_done_comment)

            send_ticket_closed_email(
                to_email=ticket.requester_email,
                customer_name=ticket.requester_name,
                ticket_id=ticket.id,
                subject=ticket.subject,
                closed_by=engineer_name,
                rectification_date=rectification_date,
                work_done_comment=work_done_comment
            )

            print(f"Closure email sent to {ticket.requester_email}")
        except Exception as e:
            print(f"Failed to send closure email: {str(e)}")

        return jsonify({"message": "Ticket closed and email sent"}), 200

    except Exception as e:
        print(f"Error closing ticket: {e}")
        return jsonify({"error": "Internal server error"}), 500



@ticket_bp.route('/history/all', methods=['GET'])
def get_all_ticket_history():
    try:
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()

        ticket_list = []
        for ticket in tickets:
            ticket_list.append({
                "id": f"{ticket.id:06d}",
                "Company": ticket.requester_company,
                "subject": ticket.subject,
                "ticketType": ticket.type,
                "description": ticket.description,
                "createdDate": ticket.created_at.strftime("%Y/%m/%d %H:%M"),
                "assignedEngineer": ticket.engineer_name if ticket.engineer_name else None,
                "status": ticket.status
            })

        return jsonify(ticket_list), 200

    except Exception as e:
        print("Error fetching ticket history:", str(e))
        return jsonify({"error": "Internal server error"}), 500
