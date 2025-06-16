from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import Engineer
from datetime import datetime, timedelta
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
        return jsonify({"token": token, "eng": {"id": eng.id, "name": eng.name, "email": eng.email}}), 200

    return jsonify({"message": "Invalid email or password"}), 401


def generate_jwt_token(eng):
    payload = {
        "id": eng.id,
        "email": eng.email,
        "name": eng.name,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # jwt.encode returns bytes in PyJWT >= 2.0, so decode to str if needed:
    return token if isinstance(token, str) else token.decode('utf-8')
