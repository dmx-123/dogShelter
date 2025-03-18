import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dog } from '../model/Dog';
import { DogService } from '../services/dog-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';

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
  dogDetails?:DogDetails;
  dog!: Dog;
  expenses:Expense[] = [];
  dogID: number | null = null;
  vendorList: string[] = [];
  breedsList: string[] = [];
  isMixedOrUnknownSelected: boolean = false;
  selectedMixed: boolean = false;
  selectedUnknown: boolean = false;


  constructor(private fb: FormBuilder, private service: DogService, private route: ActivatedRoute, private router: Router
  ) {
    this.dogForm = this.fb.group({
      dogID: [{ value: null, disabled: true }], // Auto-increment field, not editable
      name: [{ value: '', disabled: true }],
      sex: ['Unknown', Validators.required],
      description: [{ value: '', disabled: true }],
      alteration_status: [false, Validators.required],
      age: [null, [Validators.required]],
      surrender_date: [null, Validators.required],
      surrenderer_phone: ['', Validators.pattern(/^\d{0,15}$/)], // Allows up to 15 digits
      surrendered_by_animal_control: [false, Validators.required],
      add_by: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    this.dogID = Number(this.route.snapshot.paramMap.get('dogID'));
    this.isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    this.age = JSON.parse(localStorage.getItem('userAge') || '0');

    this.dogForm = this.fb.group({
      dogID: [{ value: null, disabled: true }],
      name: [{ value: '', disabled: true }],
      sex: [{ value: 'Unknown', disabled: true }],
      description: [{ value: '', disabled: true }],
      alteration_status: [{ value: false, disabled: true }],
      age: [{ value: '', disabled: true }],
      microchipID: [{ value: '', disabled: true }],
      vendor_name: [{ value: '', disabled: true }],
      breeds: [{ value: [], disabled: true }],
      surrender_date: [{ value: '', disabled: true }],
      surrenderer_phone: [{ value: '', disabled: true }],
      surrendered_by_animal_control: [{ value: false, disabled: true }],
    });

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

            this.dogForm.patchValue({
              ...this.dog,
              breeds: breedsArray
            });
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

  get vendorNameControl(){
    return this.dogForm.get('vendor_name');

  }

  setFieldAccessibility(dog: Dog): void {
    if (dog.sex === 'Unknown') {
      this.sexControl?.enable();
    }
    if (!dog.alteration_status) {
      this.alterationStatusControl?.enable();
    }
    if (this.age > 18 && !dog.microchipID) {
      this.dogForm.get('microchipID')?.enable();
    }
    if (['Unknown', 'Mixed'].includes(dog.breeds)) {
      this.breedControl?.enable();
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
    this.service.getVendorsList().subscribe({
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
    this.router.navigate(['/add-adoption-application', { dogID: this.dogID }]);
  }

  addExpense(): void {
    this.router.navigate(['/add-expense', this.dogID ]);
  }

  onSubmit(): void {
    if (this.dogForm.valid) {
      console.log('Form Data:', this.dogForm.value);
    }
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }

}
