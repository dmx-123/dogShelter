import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DogDashboard } from '../model/DogDashboard';
import { DogService } from '../services/dog-service.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-dog-dashboard',
  templateUrl: './dog-dashboard.component.html',
  styleUrl: './dog-dashboard.component.css'
})
export class DogDashboardComponent {
  filterForm: FormGroup;
  displayedColumns: string[] = ['name', 'age', 'breed', 'adoptability_status'];
  dataSource!: DogDashboard[];
  isAdmin: boolean = false;
  dogs: DogDashboard[] = [];
  filteredDogs: DogDashboard[] = [];

  count: number = 0;

  constructor(private router: Router, private service: DogService) {
    this.filterForm = new FormGroup({
      adoptabilityFilter: new FormControl('All')
    });
  }

  ngOnInit() {

    this.isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    this.service.getDogs().subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        this.filterDogs();
      },
      error: (err) => console.error('Failed to fetch dogs', err)
    });

    this.filterDogs();
    //Get shelter availability
    this.service.getAvailabilityCount().subscribe({
      next: (count) => this.count = count,
      error: (err) => console.error('Failed to fetch count', err)
    });
    this.filterForm.get('adoptabilityFilter')?.valueChanges.subscribe(value => {
      this.filterDogs();
    });

  }

  filterDogs(): void {
    const filterValue = this.filterForm.get('adoptabilityFilter')?.value;
    switch (filterValue) {
      case 'Ready for adoption':
        this.filteredDogs = this.dogs.filter(dog => Boolean(dog.adoptability_status));
        break;
      case 'Not ready for adoption':
        this.filteredDogs = this.dogs.filter(dog =>  !Boolean(dog.adoptability_status));
        break;
      default:
        this.filteredDogs = this.dogs;
    }
    this.dataSource = this.filteredDogs;

  }

  onDogSelect(dogID: number): void {
    this.router.navigate(['/dog-details', dogID]);
  }

  addDog(): void {
    this.router.navigate(['/add-dog']);
  }

}
