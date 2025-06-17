from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Customer(db.Model):
    __tablename__ = 'customer'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    designation = db.Column(db.String(100))
    mobile = db.Column(db.String(20))
    company = db.Column(db.String(120))
    address = db.Column(db.String(255))
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
    requester_email = db.Column(db.String(120))
    requester_contact = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    closed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50))
    documents = db.Column(db.Text)  # Store file URLs or paths as comma-separated strings
    engineer_name = db.Column(db.String(120))
    engineer_contact = db.Column(db.String(20))


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