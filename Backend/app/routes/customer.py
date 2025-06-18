from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Customer
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from app.models import Ticket

customer_bp = Blueprint("customer", __name__, url_prefix="/api/customers")  # Adjust prefix to match frontend

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

    # Otherwise, normal DB authentication
    cus = Customer.query.filter_by(email=email).first()
    if cus and cus.check_password(password):
        token = generate_jwt_token(cus)
        return jsonify({"token": token, "cus": {"id": cus.id, "name": cus.name, "email": cus.email,"company":cus.company,"mobile": cus.mobile,"designation": cus.designation,}}), 200

    return jsonify({"message": "Invalid email or password"}), 401


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
