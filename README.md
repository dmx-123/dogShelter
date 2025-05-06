#### Tech Stack: Python + Flask + Angular + TypeScript + MySQL + JWT  
A system for administrators and volunteers to manage rescue and adoption status of dogs in the shelter. 

## Backend & Database Setup Instructions

### 1. Install and Start MySQL
`brew install mysql`
`brew services start mysql`

### 2. Locate init scripts and run with mysql
`mysql -u root -p < init.sql`
Then user_seed.sql must be first loaded, then dog_breeds.sql, expense_category.sql, mirochipVendor.sql, dog_seed.sql, expense_seed.sql, adoption_application_seed.sql.


### 3. Init Run app
`python3 -m venv venv`  
`source venv/bin/activate` (for Linux/MacOS) or `venv\bin\Activate.ps1` (for Windows PowerShell)  
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

#### Contributors: Hanwen Zhang, Chu Kwan Louisa Lee, Mingxin Dong, Huiyue Zhou  
