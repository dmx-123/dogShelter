import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Dog } from '../model/Dog';
import { DogDashboard } from '../model/DogDashboard';

@Injectable({
  providedIn: 'root'
})
export class DogService {

  private dogs: Dog[] = [
    new Dog(1, 'Rex', 'Male', 'Very active and friendly.', true, 5, '1234567890', new Date(), '555-1234', false, 'John Doe', 'Vendor A', 'German Shepherd'),
    new Dog(2, 'Bella', 'Female', 'Calm and loving.', false, 3, null, new Date(), '555-5678', true, 'Jane Doe', null, 'Unknown')
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

  // getDog(dogID: string): Observable<Dog> {
  //   return this.http.get<Dog>(`${this.apiUrl}/dog=${dogID}`);
  // }
  getDogs(): Dog[] {
    return this.dogs;
  }
  
  getDog(dogID: string): Observable<Dog | undefined> {
    const dog = this.dogs.find(d => d.dogID === Number(dogID));
    return of(dog);
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
