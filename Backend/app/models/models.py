from flask import current_app
import jwt
from sqlalchemy import DateTime
from app import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.dialects.mysql import TIMESTAMP

class Customer(db.Model):
    __tablename__ = 'customer'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    designation = db.Column(db.String(100))
    mobile = db.Column(db.String(20))
    company = db.Column(db.String(120))
    password = db.Column(db.String(255), nullable=False)
    subscription = db.Column(db.String(50))
    profile_image = db.Column(db.String(255), nullable=True) 
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Engineer(db.Model):
    __tablename__ = 'engineer'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(20))
    designation = db.Column(db.String(100))
    password = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True) 
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Ticket(db.Model):
    __tablename__ = 'ticket'
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100))
    description = db.Column(db.Text)
    priority = db.Column(db.String(50))
    requester_name = db.Column(db.String(120))
    requester_company = db.Column(db.String(120))
    requester_email = db.Column(db.String(120))
    requester_contact = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    closed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50))
    documents = db.Column(db.Text)  # Store file URLs or paths as comma-separated strings
    engineer_name = db.Column(db.String(120))
    engineer_contact = db.Column(db.String(20))
    work_done_comment = db.Column(db.Text)
    rectification_date = db.Column(db.DateTime, nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=True)


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mobile = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    otp = db.Column(db.String(6))
    otp_expiry = db.Column(db.DateTime)
    profile_image = db.Column(db.String(255), nullable=True) 


    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
class Comment(db.Model):
    __tablename__ = 'comment'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    author_name = db.Column(db.String(120), nullable=False)
    author_role = db.Column(db.String(20), nullable=False)  # 'customer' or 'engineer'
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    attachment_path = db.Column(db.String(255))  # Optional
    attachment_type = db.Column(db.String(20))  # e.g., 'image', 'document'

    
class OTPModel(db.Model):
    __tablename__ = 'otp'

    email = db.Column(db.String(120), primary_key=True)
    otp = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)

    def generate_reset_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")
        return s.dumps(self.email)


class LoginAttempt(db.Model):
    __tablename__ = 'login_attempts'

    email = db.Column(db.String(255), primary_key=True)
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    last_attempt = db.Column(db.DateTime, nullable=True)
    locked_until = db.Column(db.DateTime, nullable=True) 
    
    
class SupportType(db.Model):
    __tablename__ = 'support_type'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) 
    ticket_limit = db.Column(db.Integer, nullable=False)


class CompanySupport(db.Model):
    __tablename__ = 'company_support'

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(120), unique=True, nullable=False)  # Company name (same as used in Customer)
    support_type = db.Column(db.String(50), nullable=False)  # Must match a SupportType.name
    location = db.Column(db.String(200), nullable=True)
    contact_person = db.Column(db.String(100), nullable=True)
    contact_mobile = db.Column(db.String(20), nullable=True)
    account_manager = db.Column(db.String(100), nullable=True)
    
    
class SRQuotaUsage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    month = db.Column(db.String(7), nullable=False)  # Format: "YYYY-MM"
    used_extra = db.Column(db.Boolean, default=False)

class AdditionalTicketBundle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    month = db.Column(db.String(7), nullable=False)  # "YYYY-MM"
    additional_tickets = db.Column(db.Integer, default=0)
    source = db.Column(db.String(20), nullable=False, default="manual")  # NEW FIELD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    added_by = db.Column(db.String(100), nullable=True)

class AccountManager(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mobile = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True) 

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)