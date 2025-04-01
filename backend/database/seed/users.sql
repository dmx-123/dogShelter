USE cs6400_sp25_team001;

INSERT INTO User (email, password, first_name, last_name, birthdate, phone_number) 
VALUES ('admin@burdell.org', 'admin123', 'George', 'Burdell', '1970-01-01', '555-123-4567');

INSERT INTO ExecutiveDirector (email) 
VALUES ('admin@burdell.org');

-- Regular Volunteer (normal user, over 18)
INSERT INTO User (email, password, first_name, last_name, birthdate, phone_number) 
VALUES ('volunteer1@burdell.org', 'volunteer1', 'Jane', 'Doe', '1995-05-20', '555-987-6543');

-- Regular Volunteer (normal user, over 18)
INSERT INTO User (email, password, first_name, last_name, birthdate, phone_number) 
VALUES ('volunteer2@burdell.org', 'volunteer2', 'John', 'Doe', '2010-05-20', '555-456-7890');