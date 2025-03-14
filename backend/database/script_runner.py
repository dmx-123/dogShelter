from datetime import date, datetime
import os
from typing import List, Optional
import mysql.connector

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
                WHERE d.dogID NOT IN (SELECT dogID FROM ApprovedApplication)
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
    cursor = conn.cursor(dictionary=True)
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
    cursor = conn.cursor(dictionary=True)
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
    cursor = conn.cursor(dictionary=True)
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
                    d.dogID, d.name, d.sex, d.description, d.alteration_status, d.age, m.microchipID, d.surrender_date, d.surrenderer_phone, d.surrendered_by_animal_control, d.add_by, m.vendor_name, 
                    (SELECT GROUP_CONCAT(db.breed_type ORDER BY db.breed_type ASC SEPARATOR '/') 
                    FROM DogBreed db WHERE db.dogID = d.dogID) AS breeds
                FROM Dog d 
                LEFT JOIN Microchip m ON d.dogID = m.dogID
                WHERE d.dogID = %s;
            """
    cursor.execute(query, (id))
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
    cursor.execute(query, (name, sex, description, alteration_status, age, surrender_date, surrenderer_phone, surrendered_by_animal_control, email))
    res = cursor.lastrowid
    cursor.close()
    conn.close()
    return res

def update_dog(id: int, sex: str, alternation_status: bool): 
    """
    Update a dog's information by ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                UPDATE Dog SET sex = %s, alteration_status = %s WHERE dogID = %s;
            """
    cursor.execute(query, (sex, alternation_status, id))
    cursor.close()
    conn.close()

def add_dog_breeds(dog_id: int, breeds: List[str]):
    """
    Insert breeds for a dog into the DogBreed table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                INSERT INTO DogBreed (dogID, breed_type) VALUES (%s, %s);
            """
    for breed in breeds:
        cursor.execute(query, (dog_id, breed))
    cursor.close()
    conn.close()
    
def remove_dog_breeds(dog_id: int,):
    """
    Delete breeds for a dog in the DogBreed table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                DELETE DogBreed WHERE dogID = %s;
            """
    cursor.execute(query, (dog_id,))
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
                SELECT count(1) AS exist FROM Microchip WHERE microchipID  = %s';
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
    cursor.execute(query, (microchip_id, dog_id, vendor_name))
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
    cursor.execute(query, (id, vendor_name, date))
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res['exist'] > 1

def add_expense(id: str, vendor_name: str, date: date, amount: float, category_name: str):
    """
    Add an expense record to the Expense table.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                NSERT INTO Expense (dogID, date, vendor_name, amount, category_name)
                VALUES (%s, %s, %s, %s, %s);
            """
    cursor.execute(query, (id, date, vendor_name, amount, category_name))
    cursor.close()
    conn.close()

# Adoption related
## todo: add more functions here

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
                    LOWER(first_name) LIKE CONCAT('%', LOWER(%s), '%')
                    OR LOWER(last_name) LIKE CONCAT('%', LOWER(%s), '%')
                    AND email NOT IN (SELECT email FROM ExecutiveDirector)
                ORDER BY last_name ASC, first_name ASC;
            """
    cursor.execute(query, (name, name))
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
                WHERE MONTH(birthdate) = %s AND email NOT IN (SELECT email FROM ExecutiveDirector)
                ORDER BY last_name ASC, first_name ASC;
            """
    cursor.execute(query, (year, month))
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
                )
                SELECT
	                m.ym AS month,
                    SUM(
                        CASE 
                            WHEN d.surrendered_by_animal_control = TRUE
                            AND DATE_FORMAT(d.surrender_date, '%Y-%m') = m.ym
                            THEN 1
                            ELSE 0
                        END
                    ) AS animal_control_surrender_count,
                    SUM(
                        CASE 
                            WHEN aa.adoption_date IS NOT NULL
                            AND DATE_FORMAT(aa.adoption_date, '%Y-%m') = m.ym
                            AND DATEDIFF(aa.adoption_date, d.surrender_date) + 1 >= 60
                            THEN 1
                            ELSE 0
                        END
                    ) AS adopted_60plus_days_count,
                    SUM(
                        CASE 
                            WHEN aa.adoption_date IS NOT NULL
                            AND DATE_FORMAT(aa.adoption_date, '%Y-%m') = m.ym
                            THEN IFNULL(e.amount, 0)
                            ELSE 0
                        END
                    ) AS total_expenses_for_adopted_dogs
                FROM months AS m
                CROSS JOIN Dog d
                LEFT JOIN ApprovedApplication aa ON aa.dogID = d.dogID
                LEFT JOIN Expense e ON e.dogID = d.dogID
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
                LEFT JOIN ApprovedApplication a ON a.dogID = d.dogID
                WHERE 
                    d.surrendered_by_animal_control = TRUE
                    AND DATE_FORMAT(d.surrender_date, '%Y-%m') = %s
                ORDER BY d.dogID ASC;
            """
    cursor.execute(query, (month,))
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
    cursor.execute(query, (month,))
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
                    COALESCE(e.total_expense, 0) AS total_expense
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
                )
                SELECT 
                m.month_ym AS month,
                db.breed_label,
                SUM(
                    CASE
                        WHEN DATE_FORMAT(d.surrender_date, '%Y-%m') = m.month_ym
                        THEN 1
                        ELSE 0
                    END
                ) AS num_surrendered,
                SUM(
                    CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN 1
                        ELSE 0
                    END
                ) AS num_adoption,
                SUM(
                    CASE
                        WHEN a.adoption_date IS NOT NULL
                        AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym
                        THEN e.total_expense
                        ELSE 0
                    END
                ) AS total_expense,
                SUM(
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
                ) AS total_adoption_fee,
                SUM(
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
                ) AS net_profit
                FROM months AS m
                CROSS JOIN Dog d
                INNER JOIN dog_breeds db ON db.dogID = d.dogID
                LEFT JOIN dog_adoption a ON a.dogID = d.dogID
                LEFT JOIN dog_expenses e ON e.dogID = d.dogID
                WHERE 
                    DATE_FORMAT(d.surrender_date, '%Y-%m') = m.month_ym
                    OR 
                    (a.adoption_date IS NOT NULL AND DATE_FORMAT(a.adoption_date, '%Y-%m') = m.month_ym)
                GROUP BY m.month_ym, db.breed_label
                ORDER BY m.month_ym ASC, db.breed_label ASC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

def expense_analysis():
    """
    Retrieve expense analysis.
    Returns a list of dictionaries containing the expense records.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
                SELECT e.vendor_name, COALESCE(SUM(e.amount), 0) AS total_expense
                FROM Expense e ON e.vendor_name = e.vendor_name
                GROUP BY e.vendor_name
                ORDER BY total_expense DESC;
            """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res