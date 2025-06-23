from flask import current_app
import jwt
from app import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer

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


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mobile = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(128), nullable=False)

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
    
class OTPModel(db.Model):
    __tablename__ = 'otp'

    email = db.Column(db.String(120), primary_key=True)
    otp = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)

    def generate_reset_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt="reset-password")
        return s.dumps(self.email)

    