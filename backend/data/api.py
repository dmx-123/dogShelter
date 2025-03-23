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
    return jsonify({"data": dogs}), 200

@dog_blueprint.route('/availability', methods=['GET'])
@token_required
def view_shelter_availability():
    count = db.dogs_count_in_shelter()
    space = int(os.getenv('SPACE'))
    return jsonify({"data": {"availability": space - count}}), 200

@dog_blueprint.route('/<int:dogID>', methods=['GET'])
@token_required
def view_dog(dogID):
    dog = db.get_dog(dogID)
    expenses = db.get_expense_by_category(dogID)
    return jsonify({"data": {"dog": dog, "expense": expenses}}), 200

@dog_blueprint.route('/<int:dogID>', methods=['POST'])
@token_required
def edit_dogs(dogID):
    data = request.json
    
    sex = data.get('sex')
    if (sex != 'Unknown' or sex != 'Female' or sex != 'Male'):
        return jsonify({"error": "Invalid sex"}), 400
    alteration_status = data.get('alteration_status')
    db.update_dog(id=dogID, sex=sex, alteration_status=alteration_status)
    
    microchipID = data.get('microchipID')
    if microchipID:
        vendor = data.get('vendor')
        if not vendor:
            return jsonify({"error": "Vendor required"}), 400
        db.add_dog_microchip(dogID, microchipID, vendor)
        
    breeds = data.get('breeds')
    if breeds:
        db.delete_dog_breeds(dogID)
        db.add_dog_breeds(dogID, breeds)
        
    return jsonify(), 200

@dog_blueprint.route('', methods=['POST'])
@token_required
def add_dogs():
    data = request.json
    
    name = data.get('name')
    sex = data.get('sex')
    age = data.get('age')
    alteration_status = data.get('alteration_status')
    description = data.get('description')
    surrender_date = data.get('surrender_date')
    surrenderer_phone = data.get('surrenderer_phone')
    surrenderer_by_animal_control = data.get('surrenderer_by_animal_control')
    microchipID = data.get('microchipID')
    mircrochip_vendor = data.get('mircrochip_vendor')
    breeds = data.get('breeds')
    email = data.get('email')
    
    if microchipID:
        if not mircrochip_vendor:
            return jsonify({"error": "Vendor required"}), 400
        if db.microchip_exist(microchipID):
            return jsonify({"error": "Microchip already exist"}), 400
        
    if name == 'Uga' and breeds.contains('Bulldog'):
        return jsonify({"error": "Bulldog named Uga could not be accepted to shelter."}), 400
    
    if surrenderer_by_animal_control == True and not surrenderer_phone:
        return jsonify({"error": "Surrenderer phone is required if surrendered by animal control"}), 400
    
    new_dogID = db.add_dog(name, sex, description, alteration_status, age, surrender_date, surrenderer_phone, surrenderer_by_animal_control, email)
    db.add_dog_microchip(new_dogID, microchipID, mircrochip_vendor)
    db.add_dog_breeds(new_dogID, breeds)
        
    return jsonify(), 200

@dog_blueprint.route('/addExpense', methods=['POST'])
@token_required
def add_expense():
    data = request.json
    dogID = data.get('dogID')
    vendor_name = data.get('vendor_name')
    category_name = data.get('category_name')
    amount = data.get('amount')
    date = data.get('date')
    
    check = db.expense_exist(dogID, vendor_name, date)
    if check:
        return jsonify({"error": "Expense already exist"}), 400
    else:
        db.add_expense(dogID, vendor_name, date, amount, category_name)
    return jsonify(), 200

util_blueprint = Blueprint('util', __name__)

@util_blueprint.route('/breedList', methods=['GET'])
# @token_required
def get_breeds_list():
    breeds = db.get_breeds()
    return jsonify({"data": breeds}), 200

@util_blueprint.route('/expenseCategoryList', methods=['GET'])
@token_required
def get_categories_list():
    categories = db.get_expense_categories()
    return jsonify({"data": categories}), 200

@util_blueprint.route('/microchipVendorList', methods=['GET'])
@token_required
def get_vendors_list():
    vendors = db.get_microchip_vendors()
    return jsonify({"data": vendors}), 200

report_blueprint = Blueprint('report', __name__)

@report_blueprint.route('/volunteerLookup', methods=['POST'])
@token_required
def volunteer_lookkup():
    data = request.json
    input = data.get('input')
    
    res = db.volunteer_lookup( input)
    return jsonify({ "data": res}), 200

@report_blueprint.route('/volunteerBirthdayReport', methods=['POST'])
@token_required
def volunteer_birthday_report():
    data = request.json
    month = int(data.get('month'))
    year = int(data.get('year'))
    if (month < 1 or month > 12):
        return jsonify({"error": "Invalid month"}), 400
    if (year < 1900 or year > 2100):    
        return jsonify({"error": "Invalid year"}), 400
    
    res = db.volunteer_birthday_report(month, year)
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport', methods=['GET'])
@token_required
def animal_control_report():
    res = db.animal_control_report()
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport/animalControlSurrender', methods=['POST'])
@token_required
def animal_control_surrender_report():
    data = request.json
    month = int(data.get('month'))
    year = int(data.get('year'))
    if not year or not month:
        return jsonify({"error": "Both year and month is required"}), 400
    
    if (month < 1 or month > 12):
        return jsonify({"error": "Invalid month"}), 400
    if (year < 1900 or year > 2100):    
        return jsonify({"error": "Invalid year"}), 400
    
    res = db.animal_control_surrender_drilldown_report(f"{year}-{int(month):02d}")
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport/sixtyDaysOrMore', methods=['POST'])
@token_required
def sixty_days_or_more_drilldown_report():
    data = request.json
    month = int(data.get('month'))
    year = int(data.get('year'))
    if not year or not month:
        return jsonify({"error": "Both year and month is required"}), 400
    
    if (month < 1 or month > 12):
        return jsonify({"error": "Invalid month"}), 400
    if (year < 1900 or year > 2100):    
        return jsonify({"error": "Invalid year"}), 400
    
    res = db.sixty_days_or_more_drilldown_report(f"{year}-{int(month):02d}")
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport/expense', methods=['POST'])
@token_required
def expense_drilldown_report():
    data = request.json
    month = int(data.get('month'))
    year = int(data.get('year'))
    if not year or not month:
        return jsonify({"error": "Both year and month is required"}), 400
    
    if (month < 1 or month > 12):
        return jsonify({"error": "Invalid month"}), 400
    if (year < 1900 or year > 2100):    
        return jsonify({"error": "Invalid year"}), 400
    
    res = db.total_expense_drilldown_report(f"{year}-{int(month):02d}")
    return jsonify({"data": res}), 200

@report_blueprint.route('/monthlyAdoptionReport', methods=['GET'])
@token_required
def monthly_adoption_report():
    res = db.monthly_adoption_report()
    return jsonify({"data": res}), 200

@report_blueprint.route('/expenseAnalysis', methods=['GET'])
@token_required
def expense_analysis():
    res = db.expense_analysis()
    return jsonify({"data": res}), 200