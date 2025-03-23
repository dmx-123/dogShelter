import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Dog } from '../model/Dog';
import { DogDashboard } from '../model/DogDashboard';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';
import { AdoptionApplication } from '../model/AdoptionApplication';
import { ApprovedApplication } from '../model/ApprovedApplication';
import { Adopter } from '../model/Adopter';
import { ApplicationExpense } from '../model/ApplicationExpense';

@Injectable({
  providedIn: 'root'
})
export class DogService {


  private dogDashboards: DogDashboard[] = MOCK_DOGS.map(dog => new DogDashboard(
    dog.dogID,
    dog.name,
    dog.age,
    dog.breeds,
    dog.alteration_status && dog.microchipID != null
  ));

  private dogSource = new BehaviorSubject<any>(null);
  currentDog = this.dogSource.asObservable();

  private apiUrl = "http://localhost:8080";

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<{ token: string; data: { isAdmin: boolean; age: number } }>(
      `${this.apiUrl}/login`, body);
  }

  // getDogs(): Observable<DogDashboard[]> {
  //   return this.http.get<DogDashboard[]>(`${this.apiUrl}/list`);
  // }

  // getDog(dogID: string): Observable<DogDetails> {
  //   return this.http.get<DogDetails>(`${this.apiUrl}/${dogID}`);
  // }

  changeDog(dog: any) {
    this.dogSource.next(dog);
  }

  updateDog(dogID: number, requestBody: any): Observable<Object> {
    return this.http.post(`${this.apiUrl}/${dogID}`, requestBody)
  }

  saveExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addExpense`, expenseData);
  }

  getDogs(): Dog[] {
    return MOCK_DOGS
  }

  getDog(dogID: number): Observable<DogDetails | undefined> {
    const dog = MOCK_DOGS.find(d => d.dogID === dogID);
    if (!dog) {
      return of(undefined); // If dog not found, return undefined
    }
    const dogExpenses = MOCK_EXPENSES.filter(exp => exp.dogID === dogID);
    return of(new DogDetails(dog, dogExpenses));
  }
  // getVendorsList(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/vendorList`);
  // }
  getVendorsList(): Observable<string[]> {
    return of(['Vendor A', 'Vendor B', 'Vendor C']);
  }

  // getBreedList(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/breedList`);
  // }
  getBreedList(): Observable<string[]> {
    return of(['Labrador', 'Golden Retriever', 'German Shepherd', 'Mixed', 'Unknown']);
  }

  getDogDashboards(): DogDashboard[] {
    return this.dogDashboards;
  }
  // getAvailabilityCount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/availability`);
  // }
  getAvailabilityCount(): number {
    return 5;
  }

  getCategoriesList(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/expenseCategoryList`);
  }

  // getVendorsList(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/microchipVendorList`);
  // }

  // getPendingApplications(): Observable<AdoptionApplication[]> {
  //   return this.http.get<AdoptionApplication[]>(`${this.apiUrl}/pendingApplicationList`);
  // }
  getPendingApplications(): Observable<AdoptionApplication[]> {
    const pending = MOCK_ADOPTERS;
    return of(pending);
  }
  approveApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pendingApplicationList/approve`, { submit_date, email });
  }

  rejectApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pendingApplicationList/reject`, { submit_date, email });
  }

  getLatestApplication(email: string): Observable<ApplicationExpense> {
    return this.http.post<ApplicationExpense>(`${this.apiUrl}/approvedApplication`, { email });
  }
  // getAdopters(lastname:string):Observable<Adopter[]>{
  //   return this.http.post<Adopter[]>(`${this.apiUrl}/adoptersList`,{lastname});
  // }

  getAdopters(lastname: string): Observable<Adopter[]> {
    // Filter mock adopters by last name (case-insensitive)
    const filteredAdopters = MOCK_ADOPTERS.filter(adopter =>
      adopter.last_name.toLowerCase().includes(lastname.toLowerCase())
    );
    return of(filteredAdopters); 
  }
  getLatestApprovedApplication(email: string): Observable<ApprovedApplication | undefined> {
    const approvedApplication = MOCK_APPROVED_APPLICATIONS.find(app => app.email === email);
    return of(approvedApplication);
  }
  addAdoption(application: ApprovedApplication): Observable<Object> {
    return this.http.post<Object>(`${this.apiUrl}/adoption`, { application });
  }

  checkEmailExists(email: string): Observable<Adopter> {
    return this.http.post<Adopter>(`${this.apiUrl}/adopter`, { email });
  }
  submitApplication(data:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/newApplication`, { data });
  }
  //Reports

  getMonthlyReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/monthlyAdoptionReport`);
  }
  
  getExpenseAnalysis():Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/expenseAnalysis`)
  }

  getBirthdayReport(month: number, year: number): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/volunteerBirthdayReport`, { month, year });
  }

  lookupVolunteers(input: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/volunteerLookup`, { input });
  }

  getSummary() {
    return this.http.get<any>(`${this.apiUrl}/animalControlReport`);
  }

  getSurrenders(year: number, month: number) {
    return this.http.post<any>(`${this.apiUrl}/animalControlReport/animalControlSurrender`, { year, month });
  }

  getSixtyPlus(year: number, month: number) {
    return this.http.post<any>(`${this.apiUrl}/animalControlReport/sixtyDaysOrMore`, { year, month });
  }

  getExpenses(year: number, month: number) {
    return this.http.post<any>(`${this.apiUrl}/animalControlReport/expense`, { year, month });
  }
}

const MOCK_EXPENSES: Expense[] = [
  new Expense(1, new Date('2024-03-10'), 'Pet Food Store', 50, 'Food'),
  new Expense(1, new Date('2024-03-12'), 'Vet Clinic', 120, 'Vet'),
  new Expense(2, new Date('2024-03-15'), 'Trainer', 80, 'Training')
];

const MOCK_DOGS:Dog[] = [
  new Dog(1, 'Buddy', 'Male', 'Friendly Golden Retriever', true, 3, new Date('2024-02-15'), '555-1234', false, 'AdminUser', "asd", null, 'Golden Retriever'),
  new Dog(2, 'Bella', 'Female', 'Calm Labrador Retriever', false, 4.5, new Date('2024-01-10'), '123456897', true, 'RescueCenter', null, null, 'Mixed')
]
const MOCK_ADOPTERS: AdoptionApplication[] = [
  new AdoptionApplication(
    'alice.smith@example.com',
    new Date('2024-02-10'),
    'Alice',
    'Smith',
    '555-9876',
    3,
    '123 Oak Street',
    'Springfield',
    'IL',
    '62704'
  ),
  new AdoptionApplication(
    'bob.johnson@example.com',
    new Date('2024-02-7'),
    'Bob',
    'Smith',
    '555-4567',
    2,
    '456 Pine Avenue',
    'Columbus',
    'OH',
    '43215'
  ),
  new AdoptionApplication(
    'charlie.wilson@example.com',
    new Date('2024-02-20'),
    'Charlie',
    'Wilson',
    '555-7890',
    5,
    '789 Maple Lane',
    'Denver',
    'CO',
    '80203'
  ),
  new AdoptionApplication(
    'dana.miller@example.com',
    new Date('2024-03-01'),
    'Dana',
    'Miller',
    '555-1122',
    4,
    '159 Birch Road',
    'Austin',
    'TX',
    '73301'
  ),
  new AdoptionApplication(
    'eve.brown@example.com',
    new Date('2024-03-05'),
    'Eve',
    'Brown',
    '555-2233',
    1,
    '753 Cedar Drive',
    'Seattle',
    'WA',
    '98101'
  )
];

const MOCK_APPROVED_APPLICATIONS: ApprovedApplication[] = [
  new ApprovedApplication(
    'alice.smith@example.com',
    new Date('2024-02-10'),  // Submit Date
    new Date('2024-02-15'),  // Approved Date
    null,
    null
  ),
  new ApprovedApplication(
    'alice.smith@example.com',
    new Date('2023-02-09'),  // Submit Date
    new Date('2024-02-15'),  // Approved Date
    null,
    null
  ),
  new ApprovedApplication(
    'alice.smith@example.com',
    new Date('2024-02-08'),  // Submit Date
    new Date('2024-02-15'),  // Approved Date
    null,
    null
  ),
  new ApprovedApplication(
    'bob.johnson@example.com',
    new Date('2024-02-15'),
    new Date('2024-02-18'),
    null,
    null
  ),
  new ApprovedApplication(
    'charlie.wilson@example.com',
    new Date('2024-02-20'),
    new Date('2024-02-22'),
    null,
    null
  ),
  new ApprovedApplication(
    'dana.miller@example.com',
    new Date('2024-03-01'),
    new Date('2024-03-05'),
    null,
    null
  ),
  new ApprovedApplication(
    'eve.brown@example.com',
    new Date('2024-03-05'),
    new Date('2024-03-07'),
    null,
    null
  )
];