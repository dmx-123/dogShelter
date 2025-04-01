USE cs6400_sp25_team001;
-- Expense for Ziggy (dog 2 - microchipped, not altered)
INSERT INTO Expense (dogID, `date`, vendor_name, amount, category_name)
VALUES 
    (2, '2025-03-04', 'PetSmart', 75.00, 'Veterinarian fees');

-- Multiple expenses for Luna (dog 3 - altered, no chip)
INSERT INTO Expense (dogID, `date`, vendor_name, amount, category_name)
VALUES
    (3, '2025-03-05', 'HappyPets', 40.00, 'Grooming supplies'),
    (3, '2025-03-07', 'VetClinic', 120.00, 'Veterinarian fees');

-- Single expense for Daisy (dog 6 - single breed)
INSERT INTO Expense (dogID, `date`, vendor_name, amount, category_name)
VALUES 
    (6, '2025-03-08', 'PetWorld', 60.00, 'Food supplies');

-- Multiple expenses for Benny (dog 7 - multiple breeds)
INSERT INTO Expense (dogID, `date`, vendor_name, amount, category_name)
VALUES 
    (7, '2025-03-09', 'PetPlanet', 25.00, 'Grooming supplies'),
    (7, '2025-03-10', 'CareVet', 150.00, 'Veterinarian fees');

-- Expense for Skippy (dog 8 - mixed breed)
INSERT INTO Expense (dogID, `date`, vendor_name, amount, category_name)
VALUES 
    (8, '2025-03-09', 'BasicVet', 90.00, 'Veterinarian fees');