from flask import Flask
from dotenv import load_dotenv

from data.api import adoption_blueprint
from data.api import user_blueprint, dog_blueprint, util_blueprint, report_blueprint
import os

# Load config
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path)

# Init DB connection
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')

# Init App 
app = Flask(__name__)

# Add features module
app.register_blueprint(user_blueprint, url_prefix='/user')
app.register_blueprint(dog_blueprint, url_prefix='/dog')
app.register_blueprint(util_blueprint, url_prefix='/util')
app.register_blueprint(report_blueprint, url_prefix='/report')
app.register_blueprint(adoption_blueprint, url_prefix='/adoption')

if __name__ == "__main__":
    app.run(port=8080, debug=True)