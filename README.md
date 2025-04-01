# cs6400-2025-01-Team001

## Backend & Database Setup Instructions

### 1. Install and Start MySQL
`brew install mysql`
`brew services start mysql`

### 2. Locate init scripts and run with mysql
`mysql -u root -p < init.sql`
'mysql -u root -p < users.sql'
usrs.sql must be first loaded


### 3. Init Run app
`python3 -m venv venv`
`source venv/bin/activate`
`pip install -r requirements.txt`
`python3 app.py`

For Angular Frontend:
1.	Angular requires Node.js (which includes npm — Node Package Manager).
•	Go to: https://nodejs.org
•	Download the LTS version (recommended for most users)
•	Verify installation:
node -v
npm -v
2.	Install Angular CLI
npm install -g @angular/cli
Verify the installation: ng version
3.	Open VS Code or other IDE. Clone our project from:
https://github.gatech.edu/cs6400-2025-01-spring/cs6400-2025-01-Team001.git
4.	cd to Frontend folder, run: npm install
will install all the packages we used and you will find a folder called node_modules created.
