USE cs6400_sp25_team001;



-- 1）Dog that is not altered and no microchip
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (1, 'Rascal', 'Male', 'Unaltered, no chip.', FALSE, 2.0, '2025-03-01', FALSE, 'volunteer1@burdell.org');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (1, 'Unknown');

-- 2) Dog that is microchipped, not altered
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (2,'Ziggy', 'Male', 'Chipped, not altered.', FALSE, 3.5, '2025-03-02', FALSE, 'volunteer1@burdell.org');
INSERT INTO Microchip (microchipID, dogID, vendor_name)
VALUES ('CHIP001', 2, 'HomeAgain');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (2, 'Unknown');

-- 3) Dog that is altered not microchipped
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (3,'Luna', 'Female', 'Spayed but no chip.', TRUE, 1.8, '2025-03-03', FALSE, 'volunteer1@burdell.org');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (3, 'Mixed'); 

-- 4) Dog that is altered and microchipped
INSERT INTO Dog (DogID,name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (4,'Cooper', 'Male', 'Altered and chipped.', TRUE, 4.2, '2025-03-04', FALSE, 'volunteer1@burdell.org');
INSERT INTO Microchip (microchipID, dogID, vendor_name)
VALUES ('CHIP002', 4, '24PetWatch');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (4, 'Unknown');

-- 5) Dog that is unknown breed
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (5,'Shadow', 'Unknown', 'Unknown breed dog.', FALSE, 1.2, '2025-03-05', FALSE, 'volunteer2@burdell.org');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (5, 'Unknown');

-- 6) Dog with single breed (not unknown/mixed)
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, add_by)
VALUES (6,'Daisy', 'Female', 'Pure Beagle.', TRUE, 2.6, '2025-03-06', FALSE, 'volunteer2@burdell.org');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (6, 'Beagle');

-- 7) Dog with multiple breeds (not unknown/mixed)
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, surrenderer_phone, add_by)
VALUES (7,'Sideways', 'Male', 'Poodle and Vizsla mix.', TRUE, 3.0, '2025-03-07',TRUE, '123-456-7899' ,'admin@burdell.org');
INSERT INTO DogBreed (dogID, breed_type) VALUES 
(7, 'Cesky Terrier'),
(7, 'Vizsla');

-- 8) Dog that is mixed breed
INSERT INTO Dog (DogID, name, sex, description, alteration_status, age, surrender_date, surrendered_by_animal_control, surrenderer_phone, add_by)
VALUES (8,'Skippy', 'Male', 'Marked as Mixed breed.', FALSE, 1.5, '2025-03-08', TRUE,'123-456-7899' ,'admin@burdell.org');
INSERT INTO DogBreed (dogID, breed_type)
VALUES (8, 'Mixed');



