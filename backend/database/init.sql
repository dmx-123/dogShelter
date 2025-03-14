-- Database initialization script
CREATE USER IF NOT EXISTS 'user'@'localhost' IDENTIFIED BY 'password';

DROP DATABASE IF EXISTS `cs6400_sp25_team001`;
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS cs6400_sp25_team001
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE cs6400_sp25_team001;

GRANT SELECT, INSERT, UPDATE, DELETE, FILE ON *.* TO 'user'@'localhost';
GRANT ALL PRIVILEGES ON cs6400_sp25_team001.* TO 'user'@'localhost';
FLUSH PRIVILEGES;

-- Tables
CREATE TABLE User (
	email varchar(250) NOT NULL,
	password varchar(60) NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	birthdate date NOT NULL,
	phone_number varchar(15) NOT NULL,
	PRIMARY KEY (email)
);

CREATE TABLE ExecutiveDirector (
	email varchar(250) NOT NULL,
	PRIMARY KEY (email)
);

CREATE TABLE Dog(
	dogID int(16) UNSIGNED NOT NULL AUTO_INCREMENT,
	name varchar(250) NOT NULL,
    sex ENUM('Male', 'Female', 'Unknown') NOT NULL DEFAULT 'Unknown',
	description varchar(250) NOT NULL,
	alteration_status boolean NOT NULL,
	age float NOT NULL,
	surrender_date date NOT NULL,
	surrenderer_phone varchar(15)  NULL,
	surrendered_by_animal_control boolean NOT NULL,
	add_by varchar(250) NOT NULL,
PRIMARY KEY (dogID)
);

CREATE TABLE Expense(
	dogID int(16) UNSIGNED NOT NULL,
	`date` date NOT NULL,
	vendor_name varchar(250) NOT NULL,
	amount float NOT NULL,
	category_name varchar(250) NOT NULL,
PRIMARY KEY (dogID, `date`,vendor_name)
);

CREATE TABLE ExpenseCategory(
	category_name varchar(250) NOT NULL,
PRIMARY KEY (category_name)
);

CREATE TABLE DogBreed(
	dogID int(16) UNSIGNED  NOT NULL,
	breed_type varchar(250) NOT NULL, 
PRIMARY KEY (dogID, breed_type)
);

CREATE TABLE Breed(
	breed_type varchar(50) NOT NULL,
PRIMARY KEY (breed_type)
);

CREATE TABLE Microchip(
	microchipID varchar(250) NOT NULL,
	dogID int(16) UNSIGNED NOT NULL,
vendor_name varchar(250) NOT NULL,
PRIMARY KEY (microchipID)
);

CREATE TABLE MicrochipVendor(
	vendor_name varchar(250) NOT NULL,
PRIMARY KEY (vendor_name)
);


CREATE TABLE Adopter (
	email varchar(250) NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	phone_number varchar(15) NOT NULL,
	household_size int(10) NOT NULL CHECK (household_size > 0),
	street varchar(100) NOT NULL,
city varchar(100) NOT NULL,
state varchar(10) NOT NULL,
zip_code varchar(10) NOT NULL,
PRIMARY KEY (email)
);

CREATE TABLE AdoptionApplication(
email varchar(250) NOT NULL,
submit_date date NOT NULL,
PRIMARY KEY (email , submit_date)
);

CREATE TABLE ApprovedApplication(
email varchar(250) NOT NULL,
submit_date date NOT NULL,
	approved_date date NOT NULL,
	adoption_date date NULL,
	dogID int(16) UNSIGNED NULL,
PRIMARY KEY (email , submit_date)
);

CREATE TABLE RejectedApplication(
email varchar(250) NOT NULL,
submit_date date NOT NULL,
	rejected_date date NOT NULL,
	PRIMARY KEY (email , submit_date)
);


-- Constraints Foreign Keys: FK_ChildTable_childColumn_ParentTable_parentColumn

ALTER TABLE ExecutiveDirector
ADD CONSTRAINT fk_ExecutiveDirector_email_User_email FOREIGN KEY (email) REFERENCES User(email);

ALTER TABLE Dog
ADD CONSTRAINT fk_Dog_addby_User_email FOREIGN KEY (add_by) REFERENCES User(email);

ALTER TABLE Expense
ADD CONSTRAINT fk_Expense_dogID_Dog_dogID FOREIGN KEY (dogID) REFERENCES Dog(dogID) ON DELETE CASCADE,
ADD CONSTRAINT fk_Expense_categoryName_ExpenseCategory_categoryName FOREIGN KEY (category_name) REFERENCES ExpenseCategory(category_name) ON DELETE CASCADE;

ALTER TABLE DogBreed
ADD CONSTRAINT fk_DogBreed_dogID_Dog_dogID FOREIGN KEY (dogID) REFERENCES Dog(dogID) ON DELETE CASCADE,
ADD CONSTRAINT fk_DogBreed_breedType_Breed_breedType FOREIGN KEY (breed_type) REFERENCES Breed(breed_type) ON DELETE CASCADE;

ALTER TABLE Microchip
ADD CONSTRAINT fk_Microchip_dogID_Dog_dogID FOREIGN KEY (dogID) REFERENCES Dog(dogID) ON DELETE CASCADE,
ADD CONSTRAINT fk_Microchip_vendorName_Vendor_vendorName FOREIGN KEY (vendor_name) REFERENCES MicrochipVendor(vendor_name) ON DELETE CASCADE;

ALTER TABLE AdoptionApplication
ADD CONSTRAINT fk_AdoptionApplication_email_Adopter_email FOREIGN KEY (email) REFERENCES Adopter(email) ON DELETE CASCADE;

ALTER TABLE ApprovedApplication
ADD CONSTRAINT fk_ApprovedApplication_pk_AdoptionApplication_pk FOREIGN KEY (email, submit_date) REFERENCES AdoptionApplication(email, submit_date) ON DELETE CASCADE,
ADD CONSTRAINT fk_ApprovedApplication_dogID_Dog_dogID FOREIGN KEY (dogID) REFERENCES Dog(dogID) ON DELETE CASCADE;

ALTER TABLE RejectedApplication
ADD CONSTRAINT fk_RejectedApplication_pk_AdoptionApplication_pk FOREIGN KEY (email, submit_date) REFERENCES AdoptionApplication(email, submit_date) ON DELETE CASCADE;


