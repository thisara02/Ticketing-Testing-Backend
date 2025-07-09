import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app import db
from app.models import Admin
from app.models import Ticket
from app.models import AccountManager
from app.models import CompanySupport
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random
from app.utils.email_utils import send_admin_otp_email
from app.models import OTPModel
from app.utils.email_utils import send_otp_email
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.models import SRQuotaUsage, AdditionalTicketBundle


accountmanager_bp = Blueprint("accountmanager", __name__, url_prefix="/api/accountmanager")


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