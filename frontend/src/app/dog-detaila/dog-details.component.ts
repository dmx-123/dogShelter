import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dog } from '../model/Dog';
import { DogService } from '../services/dog-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';
import { MessageService } from 'primeng/api';
import { ExpenseSummary } from '../model/ExpenseSummary';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-dog-details',
  templateUrl: './dog-details.component.html',
  styleUrl: './dog-details.component.css'
})
export class DogDetailComponent implements OnInit {
  isAdmin: boolean = false;
  age!: number;
  dogForm: FormGroup;
  displayedColumns: string[] = ['category_name', 'amount'];
  dogDetails?: DogDetails;
  dog!: Dog;
  expenses: ExpenseSummary[] = [];
  dogID!: number;
  vendorList: string[] = [];
  breedsList: string[] = [];
  isMixedOrUnknownSelected: boolean = false;
  selectedMixed: boolean = false;
  selectedUnknown: boolean = false;


  constructor(private fb: FormBuilder, private service: DogService, private route: ActivatedRoute, private router: Router, private messageService: MessageService
  ) {
    this.dogForm = this.fb.group({
      dogID: [{ value: null, disabled: true }],
      name: [{ value: '', disabled: true }],
      sex: [{ value: 'Unknown', disabled: true }],
      description: [{ value: '', disabled: true }],
      alteration_status: [{ value: false, disabled: true }],
      age: [{ value: '', disabled: true }],
      microchipID: [{ value: '', disabled: true }, Validators.maxLength(250)],
      microchip_vendor: [{ value: '', disabled: true }],
      breeds: [{ value: [], disabled: true }],
      surrender_date: [{ value: '', disabled: true }],
      surrenderer_phone: [{ value: '', disabled: true }],
      surrendered_by_animal_control: [{ value: false, disabled: true }],
    });
  }

  ngOnInit(): void {

    this.dogID = Number(this.route.snapshot.paramMap.get('dogID'));
    this.isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    this.age = JSON.parse(localStorage.getItem('userAge') || '0');

    this.getBreedsList();

    if (this.dogID) {
      this.service.getDog(this.dogID).subscribe({
        next: data => {
          if (data) {
            this.dogDetails = data;
            this.dog = data.dog;
            this.expenses = data.expenses;
            const breedsArray = Array.isArray(this.dog.breeds) ? this.dog.breeds : this.dog.breeds.split('/'); // Ensure array format
            this.validateBreedsSelection(breedsArray);
            let formattedSurrenderDate = '';
            if (this.dog.surrender_date) {
              formattedSurrenderDate = formatDate(this.dog.surrender_date, 'yyyy-MM-dd', 'en', 'UTC');
            }
            this.dogForm.patchValue({
              ...this.dog,
              breeds: breedsArray,
              surrender_date: formattedSurrenderDate,
            });
            console.log('Dog Details:', this.dog);
            this.setFieldAccessibility(this.dog);
          }
        },
        error: err => console.error('Failed to fetch dog details', err)
      });
    }

    this.dogForm.get('microchipID')?.valueChanges.subscribe(value => {
      if (value) {
        this.getVendorsList();
        this.vendorNameControl?.enable();
        this.vendorNameControl?.setValidators([Validators.required]);
      } else {
        this.vendorNameControl?.disable();
        this.vendorNameControl?.clearValidators();
      }
      this.vendorNameControl?.updateValueAndValidity();
    });

  }

  loadDog(): void {
    if (this.dogID) {
      this.service.getDog(this.dogID).subscribe({
        next: data => {
          if (data) {
            this.dogDetails = data;
            this.dog = data.dog;
            this.expenses = data.expenses;
            const breedsArray = Array.isArray(this.dog.breeds) ? this.dog.breeds : this.dog.breeds.split('/');
            this.validateBreedsSelection(breedsArray);

            let formattedSurrenderDate = '';
            if (this.dog.surrender_date) {
              formattedSurrenderDate = formatDate(this.dog.surrender_date, 'yyyy-MM-dd', 'en');
            }

            this.dogForm.patchValue({
              ...this.dog,
              surrender_date: formattedSurrenderDate,
              breeds: breedsArray
            });
            this.setFieldAccessibility(this.dog);
          }
        },
        error: err => console.error('Failed to fetch dog details', err)
      });
    }
  }

  get sexControl() {
    return this.dogForm.get('sex');
  }

  get breedControl() {
    return this.dogForm.get('breeds');
  }

  get alterationStatusControl() {
    return this.dogForm.get('alteration_status');
  }

  get microchipIDControl() {
    return this.dogForm.get('microchipID');
  }

  get vendorNameControl() {
    return this.dogForm.get('microchip_vendor');
  }

  get selectedBreedsDisplay(): string {
    const selectedBreeds = this.breedControl?.value;
    return selectedBreeds.length ? selectedBreeds.join('/') : 'Select breeds';
  }

  setFieldAccessibility(dog: Dog): void {
    if (dog.sex === 'Unknown') {
      this.sexControl?.enable();
    }else{
      this.sexControl?.disable();
    }
    if (!dog.alteration_status) {
      this.alterationStatusControl?.enable();
    }else{
      this.alterationStatusControl?.disable();
    }
    if (this.age > 18 && !dog.microchipID) {
      this.microchipIDControl?.enable();
    }else{
      this.microchipIDControl?.disable();

    }
    if (['Unknown', 'Mixed'].includes(dog.breeds)) {
      this.breedControl?.enable();
    }else{
      this.breedControl?.disable();
    }
    if (dog.microchip_vendor) {
      this.vendorNameControl?.disable();
    }
  }

  onBreedsChange(event: any): void {
    const selectedBreeds: string[] = event.value;
    this.validateBreedsSelection(selectedBreeds);
  }

  validateBreedsSelection(selectedBreeds: string[]): void {
    const hasMixed = selectedBreeds.includes('Mixed');
    const hasUnknown = selectedBreeds.includes('Unknown');

    if (hasMixed && hasUnknown) {
      selectedBreeds = [hasMixed ? 'Mixed' : 'Unknown'];
    }

    if (hasMixed || hasUnknown) {
      selectedBreeds = [hasMixed ? 'Mixed' : 'Unknown'];
    }
    this.dogForm.get('breeds')?.setValue(selectedBreeds, { emitEvent: false });

    // If "Mixed" or "Unknown" is selected, disable other breeds
    this.isMixedOrUnknownSelected = hasMixed || hasUnknown;

    this.selectedMixed = hasMixed;
    this.selectedUnknown = hasUnknown;
  }

  getVendorsList(): void {
    this.service.getMicrochipVendorsList().subscribe({
      next: (data: string[]) => {
        this.vendorList = data;
      },
      error: (err) => console.error('Failed to fetch vendors', err)
    });
  }

  getBreedsList(): void {
    this.service.getBreedList().subscribe(breeds => {
      this.breedsList = breeds;
    });
  }

  getTotalExpenses(): number {
    return this.expenses.map(t => t.amount).reduce((acc, value) => acc + value, 0);
  }

  addAdoption(): void {
    this.router.navigate(['/search-eligible-adopter', this.dogID]);
  }

  addExpense(): void {
    const surrenderDate = this.dogForm.get('surrender_date')?.value;
    this.router.navigate(['/add-expense', this.dogID], {
      queryParams: { surrenderDate } 
    });
  }

  onSubmit(): void {
    if (this.dogForm.valid) {
      const requestBody = {
        sex: this.dogForm.value.sex,
        alteration_status: this.dogForm.value.alteration_status,
        microchipID: this.dogForm.value.microchipID || null,
        vendor: this.dogForm.value.microchip_vendor || null,
        breeds: this.dogForm.value.breeds? this.dogForm.value.breeds : null,
      };
      this.service.updateDog(this.dogID, requestBody).subscribe({
        next: response => {
          console.log('Dog Updated:', response);
          this.loadDog();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dog details saved successfully' });

        },
        error: error => {
          console.error('Error saving dog:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error, sticky: true });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }

}
