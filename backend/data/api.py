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
def view_dogs(email):
    dogs = db.get_dogs()
    return jsonify({"data": dogs}), 200

@dog_blueprint.route('/availability', methods=['GET'])
@token_required
def view_shelter_availability(email):
    count = db.dogs_count_in_shelter()
    space = int(os.getenv('SPACE'))
    return jsonify({"data": {"availability": space - count}}), 200

@dog_blueprint.route('/<int:dogID>', methods=['GET'])
@token_required
def view_dog(email, dogID):
    dog = db.get_dog(dogID)
    expenses = db.get_expense_by_category(dogID)
    if "." in dog['surrenderer_phone']:
        dog['surrenderer_phone'] = dog['surrenderer_phone'].split(".")[0]
    return jsonify({"data": {"dog": dog, "expense": expenses}}), 200

@dog_blueprint.route('/<int:dogID>', methods=['POST'])
@token_required
def edit_dogs(email, dogID):
    data = request.json
    sex = data.get('sex')
    if sex is not None and sex not in {'Unknown', 'Female', 'Male'}:
        return jsonify({"error": "Invalid sex"}), 400
    alteration_status = data.get('alteration_status')
    db.update_dog(id=dogID, sex=sex, alteration_status=alteration_status)
    
    microchipID = data.get('microchipID')
    if microchipID and microchipID != "":
        vendor = data.get('vendor')
        if not vendor or vendor == "":
            return jsonify({"error": "Vendor required"}), 400
        if db.microchip_exist(microchipID):
            return jsonify({"error": "Microchip already exist"}), 400
        db.add_dog_microchip(dogID, microchipID, vendor)
        
    breeds = data.get('breeds')
    if breeds:
        db.remove_dog_breeds(dogID)
        db.add_dog_breeds(dogID, breeds)
        
    return jsonify(), 200

@dog_blueprint.route('', methods=['POST'])
@token_required
def add_dogs(email):
    data = request.json
    
    name = data.get('name')
    sex = data.get('sex')
    age = data.get('age')
    alteration_status = data.get('alteration_status')
    description = data.get('description')
    surrender_date = datetime.strptime(data.get('surrender_date'), "%Y-%m-%d").date()
    surrenderer_phone = None if data.get('surrenderer_phone') == "" else data.get('surrenderer_phone')
    surrenderer_by_animal_control = data.get('surrendered_by_animal_control')
    microchipID = data.get('microchipID')
    mircrochip_vendor = data.get('microchip_vendor')
    breeds = data.get('breeds')
  
    if sex not in {'Unknown', 'Female', 'Male'}:
        return jsonify({"error": "Invalid sex"}), 400
    
    if surrender_date > datetime.today().date():
        return jsonify({"error": "Surrender date cannot be in the future."}), 400
     
    if microchipID and len(microchipID) > 0:
        if not mircrochip_vendor or len(mircrochip_vendor) == 0:
            return jsonify({"error": "Vendor required"}), 400
        if db.microchip_exist(microchipID):
            return jsonify({"error": "Microchip already exist"}), 400
        
    if name.lower() == 'uga' and any('bulldog' in b.lower() for b in breeds):
        return jsonify({"error": "Bulldog named Uga could not be accepted to shelter."}), 400
    
    if surrenderer_by_animal_control == True and (not surrenderer_phone or surrenderer_phone == ""):
        return jsonify({"error": "Surrenderer phone is required if surrendered by animal control"}), 400
    
    new_dogID = db.add_dog(name, sex, description, alteration_status, age, surrender_date, surrenderer_phone, surrenderer_by_animal_control, email)
    if microchipID and len(microchipID) > 0:
        db.add_dog_microchip(new_dogID, microchipID, mircrochip_vendor)
    if breeds and len(breeds) > 0:
        db.add_dog_breeds(new_dogID, breeds)
        
    return jsonify({"data": new_dogID}), 200

@dog_blueprint.route('/addExpense', methods=['POST'])
@token_required
def add_expense(email):
    data = request.json
    dogID = data.get('dogID')
    vendor_name = data.get('vendor_name')
    category_name = data.get('category_name')
    amount = data.get('amount')
    date = datetime.strptime(data.get('date'), "%Y-%m-%d").date()
    
    if date > datetime.today().date():
        return jsonify({"error": "Expense date cannot be in the future."}), 400
    
    check = db.expense_exist(dogID, vendor_name, date)
   
    surrender_date, adoption_date = db.expense_valid_date(dogID)
    if check:
        return jsonify({"error": "Duplicate expense for this vendor and date."}), 400
    if surrender_date and date < surrender_date:
        return jsonify({"error": "Expense date cannot be before surrender date."}), 400
    if adoption_date:
        return jsonify({"error": "Could not add expense for adoted dog."}), 400
    
    db.add_expense(dogID, vendor_name, date, amount, category_name)
    return jsonify(), 200

@dog_blueprint.route('/<int:dogID>/expense', methods=['GET'])
@token_required
def get_all_expense(email, dogID):
    res = db.get_all_expense(dogID)
    return jsonify({"data": res}), 200

util_blueprint = Blueprint('util', __name__)

@util_blueprint.route('/breedList', methods=['GET'])
@token_required
def get_breeds_list(email):
    breeds = db.get_breeds()
    return jsonify({"data":[row[0] for row in  breeds]}), 200

@util_blueprint.route('/expenseCategoryList', methods=['GET'])
@token_required
def get_categories_list(email):
    categories = db.get_expense_categories()
    return jsonify({"data":  [row[0] for row in categories]}), 200

@util_blueprint.route('/microchipVendorList', methods=['GET'])
@token_required
def get_vendors_list(email):
    vendors = db.get_microchip_vendors()
    return jsonify({"data": [row[0] for row in vendors]}), 200

report_blueprint = Blueprint('report', __name__)

@report_blueprint.route('/volunteerLookup', methods=['POST'])
@token_required
def volunteer_lookup(email):
    data = request.json
    input = data.get('input')
    
    res = db.volunteer_lookup( input)
    return jsonify({ "data": res}), 200

@report_blueprint.route('/volunteerBirthdayReport', methods=['POST'])
@token_required
def volunteer_birthday_report(email):
    data = request.json
    month = int(data.get('month'))
    year = int(data.get('year'))
    if (month < 1 or month > 12):
        return jsonify({"error": "Invalid month"}), 400
    if (year < 1900 or year > 2100):    
        return jsonify({"error": "Invalid year"}), 400
    
    res = db.volunteer_birthday_report(year, month)
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport', methods=['GET'])
@token_required
def animal_control_report(email):
    res = db.animal_control_report()
    return jsonify({"data": res}), 200

@report_blueprint.route('/animalControlReport/animalControlSurrender', methods=['POST'])
@token_required
def animal_control_surrender_report(email):
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
def sixty_days_or_more_drilldown_report(email):
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
def expense_drilldown_report(email):
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
def monthly_adoption_report(email):
    res = db.monthly_adoption_report()
    return jsonify({"data": res}), 200

@report_blueprint.route('/expenseAnalysis', methods=['GET'])
@token_required
def expense_analysis(email):
    res = db.expense_analysis()
    return jsonify({"data": res}), 200


# Adding functionalities about adoption
# range from "Search Eligible Adopter" to "Approve/Reject Adoption Application"
adoption_blueprint = Blueprint('adoption', __name__)

@adoption_blueprint.route('/eligibleAdopter', methods=['POST'])
@token_required
def search_eligible_adopter(email):
    data = request.json
    last_name = data.get('lastname')
    res = db.search_eligible_adopter(last_name)
    return jsonify({"data": res}), 200

@adoption_blueprint.route('/latestApprovedApplication', methods=['POST'])
@token_required
def view_adopter_latest_approved_application(email):
    data = request.json
    adopter_email = data.get('email')
    res = db.view_adopter_latest_approved_application(adopter_email)
    return jsonify({"data": res}), 200

@adoption_blueprint.route('', methods=['POST'])
@token_required
def submit_adoption(email):
    data = request.json
    dog_id = int(data.get('dogID'))
    adopter_email = data.get('email')
    adoption_date =  datetime.strptime(data.get('adoption_date'), "%Y-%m-%d").date()
    submit_date = datetime.strptime(data.get('submit_date'), "%Y-%m-%d").date()
    if adoption_date > datetime.today().date():
        return jsonify({"error": "Adoption date cannot be in the future."}), 400  
    db.submit_adoption(adoption_date, dog_id, adopter_email, submit_date)
    return jsonify(), 200

@adoption_blueprint.route('/addApplication', methods=['POST'])
@token_required
def add_adoption_application(email):
    data = request.json
    adopter_email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone_number = data.get('phone_number')
    household_size = int(data.get('household_size'))
    street = data.get('street')
    city = data.get('city')
    state = data.get('state')
    zip_code = data.get('zip_code')
    submit_date = datetime.strptime(data.get('submit_date'), "%Y-%m-%d").date()
    
    if submit_date > datetime.today().date():
        return jsonify({"error": "Submit date cannot be in the future."}), 400
      
    is_exist = db.check_email_existence(adopter_email)
    if not is_exist:
        db.insert_new_adopter(adopter_email, first_name, last_name, phone_number, household_size, street, city, state, zip_code)

    exist = db.lookup_adoption_application(adopter_email, submit_date)
    if exist:
        return jsonify({"error": f"The adopter has already submitted an application on {submit_date}."}), 400
    else:
        db.insert_new_adoption_application(adopter_email, submit_date)
    return jsonify(), 200

@adoption_blueprint.route('/checkAdopter', methods=['POST'])
@token_required
def check_adopter_existence(email):
    data = request.json
    adopter_email = data.get('email')
    is_exist = db.check_email_existence(adopter_email)
    if is_exist:
        res = db.display_adopter_info(adopter_email)
        return jsonify({"data": res}), 200
    else:
        return jsonify({"data": None}), 200

@adoption_blueprint.route('/pendingApplication', methods=['GET'])
@token_required
def view_pending_adoption_application(email):
    pending = db.view_pending_adoption_application()
    return jsonify({"data": pending}), 200

@adoption_blueprint.route('/approveApplication', methods=['POST'])
@token_required
def add_approved_adoption_application(email):
    data = request.json
    adopter_email = data.get('email')
    approved_date = datetime.now().strftime('%Y-%m-%d') 
    submit_date = data.get('submit_date')
    db.approve_adoption_application(adopter_email, submit_date, approved_date )
    return jsonify(), 200

@adoption_blueprint.route('/rejecteApplication', methods=['POST'])
@token_required
def add_rejected_adoption_application(email):
    data = request.json
    adopter_email = data.get('email')
    rejected_date = datetime.now().strftime('%Y-%m-%d') 
    submit_date = data.get('submit_date')
    db.reject_adoption_application(adopter_email,  submit_date, rejected_date)
    return jsonify(), 200

