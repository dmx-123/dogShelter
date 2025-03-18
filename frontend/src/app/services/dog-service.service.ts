import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Dog } from '../model/Dog';
import { DogDashboard } from '../model/DogDashboard';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';

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



}
