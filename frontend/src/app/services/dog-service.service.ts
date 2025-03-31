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
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DogService {

  private dogSource = new BehaviorSubject<any>(null);
  currentDog = this.dogSource.asObservable();

  private dogUrl = "http://localhost:8080/dog";
  private userUrl = "http://localhost:8080/user";
  private utlUrl = "http://127.0.0.1:8080/util";
  private reportUrl = "http://127.0.0.1:8080/report";
  private adoptionUrl = "http://127.0.0.1:8080/adoption";
  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<{ token: string; data: { isAdmin: boolean; age: number } }>(
      `${this.userUrl}/login`, body);
  }

  getDogs(): Observable<DogDashboard[]> {
    return this.http.get<{ data: DogDashboard[] }>(`${this.dogUrl}/list`)
      .pipe(
        map(res => res.data)
      );
  }

  getAvailabilityCount(): Observable<number> {
    return this.http.get<{ data: { availability: number } }>(`${this.dogUrl}/availability`).pipe(
      map(res => res.data.availability)
    );
  }


  getDog(dogID: number): Observable<DogDetails> {
    return this.http.get<DogDetails>(`${this.dogUrl}/${dogID}`);
  }

  updateDog(dogID: number, requestBody: any): Observable<Object> {
    return this.http.post(`${this.dogUrl}/${dogID}`, requestBody)
  }

  addDog(dog: Dog): Observable<any> {
    return this.http.post(`${this.dogUrl}`, dog);
  }

  addExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.dogUrl}/addExpense`, expenseData);
  }

  getBreedList(): Observable<string[]> {
    return this.http.get<{ data: { breed_type: string }[] }>(`${this.utlUrl}/breedList`)
      .pipe(
        map(res => res.data.map(b => b.breed_type))
      );
  }

  getCategoriesList(): Observable<string[]> {
    return this.http.get<{ data: { category_name: string }[] }>(`${this.utlUrl}/expenseCategoryList`)
      .pipe(
        map(res => res.data.map(d => d.category_name))
      );
  }

  getMicrochipVendorsList(): Observable<string[]> {
    return this.http.get<{ data: { vendor_name: string }[] }>(`${this.utlUrl}/microchipVendorList`)
      .pipe(
        map(res => res.data.map(d => d.vendor_name))
      );
  }

  getPendingApplications(): Observable<AdoptionApplication[]> {
    return this.http.get<AdoptionApplication[]>(`${this.adoptionUrl}/pendingApplication`);
  }

  approveApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.adoptionUrl}/approveApplication`, { submit_date, email });
  }

  rejectApplication(submit_date: string, email: string): Observable<any> {
    return this.http.post(`${this.adoptionUrl}/rejecteApplication`, { submit_date, email });
  }

  getAdopters(lastname: string): Observable<Adopter[]> {
    return this.http.post<Adopter[]>(`${this.adoptionUrl}/eligibleAdopter`, { lastname });
  }

  getLatestApprovedApplication(email: string): Observable<ApprovedApplication> {
    return this.http.post<ApprovedApplication>(`${this.adoptionUrl}/latestApprovedApplication`, { email });
  }

  submitApplication(data: any): Observable<any> {
    return this.http.post(`${this.adoptionUrl}`, { data });
  }

  addAdoptionApplication(application: ApprovedApplication): Observable<Object> {
    return this.http.post<Object>(`${this.adoptionUrl}/addApplication`, { application });
  }

  checkEmailExists(email: string): Observable<Adopter> {
    return this.http.post<Adopter>(`${this.adoptionUrl}/checkAdopter`, { email });
  }

  //Reports
  lookupVolunteers(input: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.reportUrl}/volunteerLookup`, { input });
  }
  getBirthdayReport(month: number, year: number): Observable<any[]> {
    return this.http.post<any[]>(`${this.reportUrl}/volunteerBirthdayReport`, { month, year });
  }

  getMonthlyReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reportUrl}/monthlyAdoptionReport`);
  }

  getExpenseAnalysis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reportUrl}/expenseAnalysis`)
  }

  getSummary() {
    return this.http.get<any>(`${this.reportUrl}/animalControlReport`);
  }

  getSurrenders(year: number, month: number) {
    return this.http.post<any>(`${this.reportUrl}/animalControlReport/animalControlSurrender`, { year, month });
  }

  getSixtyPlus(year: number, month: number) {
    return this.http.post<any>(`${this.reportUrl}/animalControlReport/sixtyDaysOrMore`, { year, month });
  }

  getExpenses(year: number, month: number) {
    return this.http.post<any>(`${this.reportUrl}/animalControlReport/expense`, { year, month });
  }
}

