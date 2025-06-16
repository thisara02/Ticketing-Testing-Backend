from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Customer
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

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
        address = data.get("address")
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
            address=address,
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
            "address": new_customer.address,
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
            "address": c.address,
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
        return jsonify({"token": token, "cus": {"id": cus.id, "name": cus.name, "email": cus.email}}), 200

    return jsonify({"message": "Invalid email or password"}), 401


def generate_jwt_token(cus):
    payload = {
        "id": cus.id,
        "email": cus.email,
        "name": cus.name,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')
