from datetime import date, datetime, timedelta
import os
from flask import Blueprint, request, jsonify
import jwt
from data.token import token_required  
import database.script_runner as db

user_blueprint = Blueprint('user', __name__)

@user_blueprint.route('/login', methods=['POST'])
def login():
    #Parse request data
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Check if email and password are provided
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    user = db.get_user_by_email(email)
    # If user is not found
    if not user:
        return jsonify({"error": "User not found"}), 404
    # If user is found but password not matching
    if (password != user['password']):
        return jsonify({"error": "Invalid password"}), 401
    
    # Fetch user data
    birthdate = user['birthdate'] 
    today = date.today()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    user_is_admin = db.is_admin(email)
    
    # Generate JWT token
    secret_key = os.getenv('JWT_KEY')
    payload = {
        "email": user['email'],
        "isAdmin": user_is_admin,
        "age": age,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    
    return jsonify({"token": token, "data": {"isAdmin": user_is_admin, "age": age }}), 200



dog_blueprint = Blueprint('dog', __name__)

@dog_blueprint.route('/list', methods=['GET'])
@token_required
def view_dogs():
    dogs = db.get_dogs()
    return jsonify({ "data": dogs}), 200

@dog_blueprint.route('/availability', methods=['GET'])
@token_required
def view_shelter_availability():
    count = db.dogs_count_in_shelter()
    space = int(os.getenv('SPACE'))
    return jsonify({"data": {"availability": space - count}}), 200



util_blueprint = Blueprint('util', __name__)
@token_required
@util_blueprint.route('/breedList', methods=['GET'])
@token_required
def get_breeds_list():
    breeds = db.get_breeds()
    return jsonify({ "data": breeds}), 200

@util_blueprint.route('/expenseCategoryList', methods=['GET'])
@token_required
def get_categories_list():
    categories = db.get_expense_categories()
    return jsonify({ "data": categories}), 200

@util_blueprint.route('/microchipVendorList', methods=['GET'])
@token_required
def get_vendors_list():
    vendors = db.get_microchip_vendors()
    return jsonify({ "data": vendors}), 200