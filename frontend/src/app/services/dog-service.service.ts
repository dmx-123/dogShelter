import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Dog } from '../model/Dog';
import { DogDashboard } from '../model/DogDashboard';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';
import { AdoptionApplication } from '../model/AdoptionApplication';
import { ApprovedApplication } from '../model/ApprovedApplication';

@Injectable({
  providedIn: 'root'
})
export class DogService {

  private dogs: Dog[] = [
    new Dog(1, 'Buddy', 'Male', 'Friendly Golden Retriever', true, 3, new Date('2024-02-15'), '555-1234', false, 'AdminUser', null, null, 'Golden Retriever'),
    new Dog(2, 'Bella', 'Female', 'Calm Labrador Retriever', false, 4.5, new Date('2024-01-10'), '123456897', true, 'RescueCenter', null, null, 'Mixed')
  ];

  private expenses: Expense[] = [
    new Expense(1, new Date('2024-03-10'), 'Pet Food Store', 50, 'Food'),
    new Expense(1, new Date('2024-03-12'), 'Vet Clinic', 120, 'Vet'),
    new Expense(2, new Date('2024-03-15'), 'Trainer', 80, 'Training')
  ];

  private dogDashboards: DogDashboard[] = this.dogs.map(dog => new DogDashboard(
    dog.dogID,
    dog.name,
    dog.age,
    dog.breeds,
    dog.alteration_status && dog.microchipID != null
  ));

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

  updateDog(dogID: number, requestBody: any): Observable<Object> {
    return this.http.post(`${this.apiUrl}/${dogID}`, requestBody)
  }

  saveExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addExpense`, expenseData);
  }

  getDogs(): Dog[] {
    return this.dogs;
  }

  getDog(dogID: number): Observable<DogDetails | undefined> {
    const dog = this.dogs.find(d => d.dogID === dogID);
    if (!dog) {
      return of(undefined); // If dog not found, return undefined
    }
    const dogExpenses = this.expenses.filter(exp => exp.dogID === dogID);
    return of(new DogDetails(dog, dogExpenses));
  }

  getVendorsList(): Observable<string[]> {
    return of(['Vendor A', 'Vendor B', 'Vendor C']);
  }

  /** Returns mock breeds */
  getBreedList(): Observable<string[]> {
    return of(['Labrador', 'Golden Retriever', 'German Shepherd', 'Mixed', 'Unknown']);
  }

  getDogDashboards(): DogDashboard[] {
    return this.dogDashboards;
  }
  getAvailabilityCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/availability`);
  }

  // getBreedList(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/breedList`);
  // }

  getCategoriesList(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/expenseCategoryList`);
  }

  // getVendorsList(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/microchipVendorList`);
  // }

  // getPendingApplications(): Observable<AdoptionApplication[]> {
  //   return this.http.get<AdoptionApplication[]>(`${this.apiUrl}/pendingApplicationList`);
  // }
  getPendingApplications(): AdoptionApplication[] {
    return MOCK_ADOPTION_APPLICATIONS;
  }
  approveApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pendingApplicationList/approve`, { submit_date, email });
  }

  rejectApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pendingApplicationList/reject`, { submit_date, email });
  }

}
const MOCK_ADOPTION_APPLICATIONS: AdoptionApplication[] = [
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
    new Date('2024-02-15'),
    'Bob',
    'Johnson',
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