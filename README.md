# cs6400-2025-01-Team001

## Backend & Database Setup Instructions

### 1. Install and Start MySQL

`brew install mysql`
`brew services start mysql`

### 2. Locate init scripts and run with mysql
`mysql -u root -p < init.sql`

### 3. Run app
`source venv/bin/activate`
`python3 app.py`