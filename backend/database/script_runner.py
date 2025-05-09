from datetime import date, datetime
import os
from typing import List, Optional
import mysql.connector
from dateutil.relativedelta import relativedelta

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'cs6400_sp25_team001')

def get_db_connection():
    """Return a connection to the specified database."""
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
# User related 
def get_user_by_email(email: str):
    """
    Retrieve a user record by email.
    Returns boolean.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT email, password, birthdate FROM User WHERE email = %s"
    cursor.execute(query, (email,))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res

def is_admin(email: str):
    """
    Retrieve if a user is admin by email.
    Returns a dictionary containing the user record, or None if not found.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT COUNT(1) AS exist FROM ExecutiveDirector WHERE email = %s;"
    cursor.execute(query, (email,))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['exist'] == 1

# Dog related 
def get_dogs():
    """
    Retrieve a user record by email.
    Returns a list of dictionaries containing the dog records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT 
                    d.dogID, 
                    d.name, 
                    d.age, 
                    d.sex,
                    d.alteration_status,
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR '/')
                    FROM DogBreed db 
                    WHERE db.dogID = d.dogID) AS breed,
                    CASE 
                        WHEN (d.alteration_status = TRUE AND m.microchipID IS NOT NULL)
                        THEN TRUE
                        ELSE FALSE
                    END AS adoptability_status
                FROM Dog d
                LEFT JOIN Microchip m ON d.dogID = m.dogID
                WHERE NOT EXISTS (
                    SELECT 1 FROM ApprovedApplication a WHERE a.dogID = d.dogID
                )
                ORDER BY d.surrender_date ASC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def dogs_count_in_shelter():
    """
    Retrieve shelter availability.
    Returns a number.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT COUNT(d.dogID) as current_count
                FROM Dog d 
                WHERE d.dogID NOT IN 
                    (SELECT d.dogID FROM
                    ApprovedApplication
                    a WHERE a.dogID = d.dogID);
            """
    cursor.execute(query)
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['current_count']

def get_breeds():
    """
    Retrieve all breeds.
    Returns a list of string.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=False)
    query = """
                SELECT breed_type FROM Breed ORDER BY breed_type; 
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def get_expense_categories():
    """
    Retrieve all expense categories.
    Returns a list of string.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=False)
    query = """
                SELECT category_name FROM ExpenseCategory ORDER BY category_name ASC; 
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def get_microchip_vendors():
    """
    Retrieve all microchip vendors.
    Returns a list of string.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=False)
    query = """
               SELECT vendor_name FROM  MicrochipVendor ORDER BY vendor_name; 
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def get_dog(id: int):
    """
    Get a dog's information by ID.
    Returns:
    A dictionary containing the dog's information.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT 
                    d.dogID, d.name, d.sex, d.description, d.alteration_status, d.age, m.microchipID, d.surrender_date, d.surrenderer_phone, d.surrendered_by_animal_control, m.vendor_name as microchip_vendor, 
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR '/') 
                    FROM DogBreed db WHERE db.dogID = d.dogID) AS breeds
                FROM Dog d 
                LEFT JOIN Microchip m ON d.dogID = m.dogID
                WHERE d.dogID = %s;
            """
    cursor.execute(query, (id,))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res

def add_dog(name: str, sex: str, description: str, alteration_status: bool, age: float, surrender_date: date, surrenderer_phone: Optional[str], surrendered_by_animal_control: bool, email: str) -> int:
    """
    Insert a new dog into the Dog table and its breeds into DogBreed.
    Returns:
      The newly inserted dog's ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO  Dog (name, sex, description, alteration_status, age, surrender_date, surrenderer_phone, surrendered_by_animal_control, add_by) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
    cursor.execute(query, (name, sex, description, alteration_status, age, surrender_date, surrenderer_phone, surrendered_by_animal_control, email, ))
    res = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return res

def update_dog(id: int, sex: Optional[str] = None, alteration_status: Optional[bool] = None): 
    """
    Update a dog's information by ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    updates = []
    parameters = []

    if sex is not None:
        updates.append("sex = %s")
        parameters.append(sex)
    if alteration_status is not None:
        updates.append("alteration_status = %s")
        parameters.append(alteration_status)

    if not updates:
        return
    
    query = f"UPDATE Dog SET {', '.join(updates)} WHERE dogID = %s;"
    parameters.append(id)
    cursor.execute(query, tuple(parameters))
    conn.commit()
    cursor.close()
    conn.close()

def add_dog_breeds(dog_id: int, breeds: List[str]):
    """
    Insert breeds for a dog into the DogBreed table.
    """
    print(f"Breeds to add: {breeds}", flush=True) 
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO DogBreed (dogID, breed_type) VALUES (%s, %s);
            """
    for breed in breeds:
        cursor.execute(query, (dog_id, breed, ))
    conn.commit()
    cursor.close()
    conn.close()
    
def remove_dog_breeds(dog_id: int,):
    """
    Delete breeds for a dog in the DogBreed table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                DELETE FROM DogBreed WHERE dogID = %s;
            """
    cursor.execute(query, (dog_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
def microchip_exist(id: str):
    """
    Retrieve if the microchip exist.
    Returns a boolean.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT count(1) AS exist FROM Microchip WHERE microchipID  = %s;
            """
    cursor.execute(query, (id,))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['exist'] == 1
    
def add_dog_microchip(dog_id: int, microchip_id: str, vendor_name: str):
    """
    Insert a microchip for a dog into the Microchip table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO Microchip (microchipID, dogID, vendor_name) 
                VALUES (%s, %s, %s);
            """
    cursor.execute(query, (microchip_id, dog_id, vendor_name, ))
    conn.commit()
    cursor.close()
    conn.close()

def expense_exist(id: str, vendor_name: str, date: date):
    """
    Retrieve if the expense exist.
    Returns a boolean.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT COUNT(*) AS exist FROM Expense WHERE dogID = %s AND vendor_name = %s AND date = %s;
            """
    cursor.execute(query, (id, vendor_name, date, ))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['exist'] > 0

def expense_valid_date(id: str):
    """
    Check if the provided expense date is within the valid range:
    - On or after the dog's surrender date
    - On or before the dog's adoption date (if adopted)
    
    Returns True if valid, False if invalid.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT 
            d.surrender_date as surrender_date,
            a.adoption_date as adoption_date
        FROM 
            Dog d
        LEFT JOIN 
            ApprovedApplication a ON d.dogID = a.dogID
        WHERE 
            d.dogID = %s;
    """
    
    cursor.execute(query, (id,))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['surrender_date'], res['adoption_date'] if res['adoption_date'] is not None else None

def get_expense_by_category(id: str):
    """
    Retrieve expenses by category
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT category_name, ROUND(SUM(amount), 2) AS expense
                FROM Expense
                WHERE dogID = %s
                GROUP BY category_name;
            """
    cursor.execute(query, (id, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def get_all_expense(id: str):
    """
    Retrieve all expenses
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT ROUND(SUM(amount), 2) AS expense
                FROM Expense
                WHERE dogID = %s;
            """
    cursor.execute(query, (id, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def add_expense(id: str, vendor_name: str, date: date, amount: float, category_name: str):
    """
    Add an expense record to the Expense table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO Expense (dogID, date, vendor_name, amount, category_name)
                VALUES (%s, %s, %s, %s, %s);
            """
    cursor.execute(query, (id, date, vendor_name, amount, category_name, ))
    conn.commit()
    cursor.close()
    conn.close()

# -------------------------------- Adoption Related ---------------------------------------
## from "Search Eligible Adopter" to "Approve/Reject Adoption Application" in the phase-2 report
def search_eligible_adopter(last_name:str):
    """
    Search eligible adopters for an un-adopted dog,
    return a list of eligible adopters and their contact information.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT DISTINCT a.first_name, a.last_name, a.street, a.city, a.state, a.zip_code, 
                    a.email, a.phone_number
                FROM Adopter a 
                JOIN ApprovedApplication aa ON aa.email = a.email 
                WHERE aa.dogID IS NULL 
                AND LOWER(a.last_name) LIKE CONCAT('%', LOWER(%s), '%');
            """
    cursor.execute(query, (last_name, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def view_adopter_latest_approved_application(email:str):
    """
    Search the latest approved application of an eligible adopter,
    return the approved application and the contact info of this adopter.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT a.first_name, a.last_name, a.street, a.city, a.state, a.zip_code, 
                    a.email, a.phone_number, aa.submit_date, aa.approved_date 
                FROM Adopter a 
                JOIN ApprovedApplication aa ON a.email = aa.email 
                WHERE a.email = %s AND aa.dogID IS NULL ORDER BY aa.submit_date DESC LIMIT 1;
            """
    cursor.execute(query, (email, ))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res

def submit_adoption(adoption_date:str, dog_id:int, email:str, submit_date:str):
    """
    Update an adoption record to the ApprovedApplication table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                UPDATE ApprovedApplication 
                SET adoption_date = %s, dogID = %s 
                WHERE email = %s AND submit_date = %s;
            """
    cursor.execute(query, (adoption_date, dog_id, email, submit_date))
    conn.commit() 
    cursor.close()
    conn.close()

def check_email_existence(email:str):
    """
    Check if an email (adopter) exists, return a Boolean.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT COUNT(*) AS isExist FROM Adopter WHERE EMAIL = %s;
            """
    cursor.execute(query, (email, ))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['isExist'] > 0

def display_adopter_info(email:str):
    """
    Display the information of an adopter.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT email, first_name, last_name, phone_number, household_size, street, city, state, zip_code 
                FROM Adopter WHERE EMAIL = %s;
            """
    cursor.execute(query, (email, ))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res

def insert_new_adopter(email:str, first_name:str, last_name:str, phone_number:str, household_size:int, street:str, city:str, state:str, zip_code:str):
    """
    Insert a new adopter record to the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO Adopter (email, first_name, last_name, phone_number, household_size, street, city, state, zip_code) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
    cursor.execute(query, (email, first_name, last_name, phone_number, household_size, street, city, state, zip_code, ))
    conn.commit()
    cursor.close()
    conn.close()

def lookup_adoption_application(email:str, submit_date:date):
    """
    Look up if an adoption application of an eligible adopter already exists, return a Boolean.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT COUNT(*) AS result FROM AdoptionApplication
                WHERE email = %s AND submit_date = %s;
            """
    cursor.execute(query, (email, submit_date, ))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['result'] > 0

def insert_new_adoption_application(email:str, submit_date:date):
    """
    Insert a new adoption application record to the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO AdoptionApplication (email, submit_date) 
                VALUES (%s, %s);
            """
    cursor.execute(query, (email, submit_date, ))
    conn.commit()
    cursor.close()
    conn.close()

def view_pending_adoption_application():
    """
    View pending adoption application,
    return a list of pending adoption applications.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT d.email, d.first_name, d.last_name, d.phone_number, d.household_size, 
                d.street, d.city, d.state, d.zip_code, aa.submit_date 
                FROM AdoptionApplication aa 
                JOIN Adopter d ON aa.email = d.email 
                WHERE NOT EXISTS ( 
                    SELECT 1 FROM ApprovedApplication ap 
                    WHERE ap.email = aa.email AND ap.submit_date = aa.submit_date 
                    ) 
                    AND NOT EXISTS ( 
                        SELECT 1 FROM RejectedApplication rj 
                        WHERE rj.email = aa.email AND rj.submit_date = aa.submit_date 
                        );
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def approve_adoption_application(email:str, submit_date:date, current_date: date):
    """
    If an adoption application as approved, update its information to the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO ApprovedApplication (email, submit_date, approved_date) 
                VALUES (%s, %s, %s);    
            """
    cursor.execute(query, (email, submit_date, current_date, ))
    conn.commit()
    cursor.close()
    conn.close()

def reject_adoption_application(email:str, submit_date:date, rejected_date:date):
    """
    If an adoption application as rejected, update its information to the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO RejectedApplication (email, submit_date, rejected_date) 
                VALUES (%s, %s, %s);
            """
    cursor.execute(query, (email, submit_date, rejected_date, ))
    conn.commit()
    cursor.close()
    conn.close()

# ----------------------------- The End of Adoption-Related Section ----------------------

# Report related
def volunteer_lookup(name: str):
    """
    Retrieve volunteer info by search text.
    Returns a list of dictionaries volunteer info.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT first_name, last_name, email, phone_number
                FROM User
                WHERE 
                    (LOWER(first_name) LIKE CONCAT('%', LOWER(%s), '%')
                    OR LOWER(last_name) LIKE CONCAT('%', LOWER(%s), '%'))
                ORDER BY last_name ASC, first_name ASC;
            """
    cursor.execute(query, (name, name, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def volunteer_birthday_report(year: int, month: int):
    """
    Retrieve volunteer birthday report.
    Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT 
                    first_name, last_name, email,
                    CASE 
                        WHEN ((%s - YEAR(birthdate)) % 10) = 0 THEN 'Yes'
                        ELSE 'No'
                    END AS milestone_birthday
                FROM User
                WHERE MONTH(birthdate) = %s
                ORDER BY last_name ASC, first_name ASC;
            """
    cursor.execute(query, (year, month, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res
    
def animal_control_report():
    """
    Retrieve animal control report.
    Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                WITH RECURSIVE months AS (
                    SELECT DATE_FORMAT(CURDATE(), '%Y-%m') AS ym, 1 AS n
                    UNION ALL
                    SELECT DATE_FORMAT(DATE_SUB(STR_TO_DATE(CONCAT(ym, '-01'), '%Y-%m-%d'), INTERVAL 1 MONTH), '%Y-%m') AS ym,
                        n + 1
                    FROM months
                    WHERE n < 7
                ),
                dog_expenses AS (
                    SELECT dogID, ROUND(SUM(amount), 2) AS total_expense
                    FROM Expense
                    GROUP BY dogID
                )
                SELECT
	                m.ym AS month,
                    COUNT(
                        DISTINCT CASE 
                            WHEN d.surrendered_by_animal_control = TRUE
                            AND DATE_FORMAT(d.surrender_date, '%Y-%m') = m.ym
                            THEN d.dogID
                            ELSE NULL
                        END
                    ) AS animal_control_surrender_count,
                    COUNT(
                        DISTINCT CASE 
                            WHEN aa.adoption_date IS NOT NULL
                            AND DATE_FORMAT(aa.adoption_date, '%Y-%m') = m.ym
                            AND DATEDIFF(aa.adoption_date, d.surrender_date) + 1 >= 60
                            THEN d.dogID
                            ELSE NULL
                        END
                    ) AS adopted_60plus_days_count,
                    SUM(
                        CASE 
                            WHEN aa.adoption_date IS NOT NULL
                            AND DATE_FORMAT(aa.adoption_date, '%Y-%m') = m.ym
                            THEN COALESCE(e.total_expense, 0)
                            ELSE 0
                        END
                    ) AS total_expenses_for_adopted_dogs
                FROM months AS m
                CROSS JOIN Dog d
                LEFT JOIN ApprovedApplication aa ON aa.dogID = d.dogID
                LEFT JOIN dog_expenses e ON e.dogID = d.dogID
                GROUP BY m.ym
                ORDER BY m.ym DESC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def animal_control_surrender_drilldown_report(month: str):
    """
    Retrieve drill down report for dogs which surrendered by animal control adopted in the month (YYYY-mm).
       Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT
    	            d.dogID, d.sex, d.surrender_date, d.alteration_status,
                    COALESCE(m.microchipID, 'N.A.') AS microchip_id,
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR
                    '/')  FROM DogBreed db WHERE db.dogID = d.dogID)  AS breed_label
                FROM Dog d
                LEFT JOIN Microchip m ON m.dogID = d.dogID
                WHERE 
                    d.surrendered_by_animal_control = TRUE
                    AND DATE_FORMAT(d.surrender_date, '%Y-%m') = %s
                ORDER BY d.dogID ASC;
            """
    cursor.execute(query, (month, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res
 
def sixty_days_or_more_drilldown_report(month: str):
    """
    Retrieve drill down report for dogs which in shelter 60+ days adopted in the month (YYYY-mm).
    Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT
    	            d.dogID, d.sex, d.surrender_date,
                    COALESCE(m.microchipID, 'N.A.') AS microchip_id,
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR
                    '/')  FROM DogBreed db WHERE db.dogID = d.dogID)  AS breed_label,
 	                DATEDIFF(a.adoption_date, d.surrender_date) + 1 AS rescue_days
                FROM Dog d
                INNER JOIN ApprovedApplication a ON a.dogID = d.dogID
                LEFT JOIN Microchip m ON m.dogID = d.dogID
                WHERE 
	                a.adoption_date IS NOT NULL
                    AND DATE_FORMAT(a.adoption_date, '%Y-%m') = %s
                    AND (DATEDIFF(a.adoption_date, d.surrender_date) + 1) >= 60
                ORDER BY rescue_days DESC, d.dogID DESC;
            """
    cursor.execute(query, (month, ))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def total_expense_drilldown_report(month: str):
    """
    Retrieve drill down report for total expense for the month (YYYY-mm).
    Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                WITH expense_info AS (
                    SELECT e.dogID, SUM(e.amount) AS total_expense
                    FROM  Expense e
                    GROUP BY e.dogID
                )
                SELECT 
                    d.dogID, 
                    d.sex, 
                    d.surrender_date,
                    COALESCE(m.microchipID, 'N.A.') AS microchip_id,
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR
                    '/')  FROM DogBreed db WHERE db.dogID = d.dogID)  AS breed_label,
                    d.surrendered_by_animal_control,
                    ROUND(COALESCE(e.total_expense, 0), 2) AS total_expense
                FROM Dog d
                INNER JOIN  ApprovedApplication a ON a.dogID = d.dogID
                LEFT JOIN  Microchip m ON m.dogID = d.dogID
                LEFT JOIN expense_info e ON e.dogID = d.dogID
                WHERE 
                    a.adoption_date IS NOT NULL
                    AND DATE_FORMAT(a.adoption_date, '%Y-%m') = %s
                ORDER BY d.dogID ASC;
            """
    cursor.execute(query, (month,))
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res


def monthly_adoption_report():
    """
    Retrieve monthly adoption report.
    Returns a list of dictionaries containing report records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                WITH RECURSIVE months AS (
                    SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m') AS month_ym, 1 AS n
                    UNION ALL
                    SELECT DATE_FORMAT(STR_TO_DATE(CONCAT(month_ym, '-01'), '%Y-%m-%d') - INTERVAL 1 MONTH, '%Y-%m') AS month_ym, n + 1
                    FROM months
                    WHERE n < 12
                ),
                dog_breeds AS (
                SELECT  
                dogID, GROUP_CONCAT(
                        DISTINCT breed_type 
                        ORDER BY breed_type ASC SEPARATOR '/') AS breed_label
                FROM DogBreed
                GROUP BY dogID
                ),
                dog_adoption AS (
                    SELECT dogID, adoption_date
                    FROM ApprovedApplication
                    WHERE adoption_date IS NOT NULL
                ),
                dog_expenses AS (
                    SELECT dogID, COALESCE(SUM(amount), 0) AS total_expense
                    FROM Expense
                    GROUP BY dogID
                ),
                report_data AS (SELECT 
                m.month_ym AS month,
                db.breed_label,
                COUNT(
                    DISTINCT CASE
                        WHEN DATE_FORMAT(d.surrender_date, '%Y-%m') = m.month_ym
                        THEN d.DogID
                        ELSE NULL
                    END
                ) AS num_surrendered,
                COUNT(
                    DISTINCT CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN d.DogID
                        ELSE NULL
                    END
                ) AS num_adoption,
                COALESCE(SUM(
                    CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN e.total_expense
                        ELSE 0
                    END
                ), 0) AS total_expense,
                COALESCE(SUM(
                    CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN e.total_expense * 
                            (CASE 
                                WHEN d.surrendered_by_animal_control 
                                THEN 0.10 
                                ELSE 1.25 
                            END)
                        ELSE 0
                    END
                ), 0) AS total_adoption_fee,
                COALESCE(SUM(
                    CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN e.total_expense *
                            (CASE 
                                WHEN d.surrendered_by_animal_control 
                                THEN 0.10 
                                ELSE 0.25
                            END)
                        ELSE 0
                    END
                ), 0) AS net_profit
                FROM months AS m
                CROSS JOIN Dog d
                INNER JOIN dog_breeds db ON db.dogID = d.dogID
                LEFT JOIN dog_adoption a ON a.dogID = d.dogID
                LEFT JOIN dog_expenses e ON e.dogID = d.dogID
                GROUP BY m.month_ym, db.breed_label
                ORDER BY m.month_ym ASC, db.breed_label ASC
            )
            SELECT *
            FROM report_data
                WHERE num_surrendered > 0
                OR num_adoption > 0
                OR total_expense > 0
                OR total_adoption_fee > 0
                OR net_profit > 0
            ORDER BY month ASC, breed_label ASC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    report = {}
    for row in res:
        month = row['month']
        if month not in report:
            report[month] = []
        report[month].append(row)
    now = datetime.now()
    for i in range(12):
        month_str = (now - relativedelta(months=i+1)).strftime('%Y-%m')
        if month_str not in report:
            report[month_str] = []
    cursor.close()
    conn.close()
    return {month: report[month] for month in sorted(report)}

def expense_analysis():
    """
    Retrieve expense analysis.
    Returns a list of dictionaries containing the expense records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT e.vendor_name, COALESCE(SUM(e.amount), 0) AS total_expense
                FROM Expense e 
                GROUP BY e.vendor_name
                ORDER BY total_expense DESC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res
