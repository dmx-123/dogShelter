import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DogService } from '../services/dog-service.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-add-dog',
  templateUrl: './add-dog.component.html',
  styleUrls: ['./add-dog.component.css']
})
export class AddDogComponent implements OnInit {
  dogForm: FormGroup;
  breedsList: string[] = [];
  vendorList: string[] = [];
  isMixedOrUnknownSelected: boolean = false;
  selectedMixed: boolean = false;
  selectedUnknown: boolean = false;
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private service: DogService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.dogForm = this.fb.group({
      dogID: [{ value: '', disabled: true }],
      name: ['', [Validators.required, Validators.maxLength(250)]],
      sex: ['Unknown', [Validators.required, Validators.pattern(/^(Unknown|Male|Female)$/)]],
      description: ['', Validators.maxLength(250)],
      alteration_status: [false, Validators.required],
      age: [{ value: '' }, [Validators.required, Validators.min(1)]],
      microchipID: ['', [Validators.maxLength(250)]],
      microchip_vendor: ['', [Validators.maxLength(250)]],
      breeds: [[], [Validators.required, Validators.maxLength(250)]],
      surrender_date: ['', [Validators.required]],
      surrenderer_phone: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9]*$/)]],
      surrendered_by_animal_control: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getBreedsList();
    this.getVendorsList();

    this.dogForm.get('microchipID')?.valueChanges.subscribe(value => {
      if (value) {
        this.dogForm.get('microchip_vendor')?.enable();
        this.dogForm.get('microchip_vendor')?.setValidators([Validators.required]);
      } else {
        this.dogForm.get('microchip_vendor')?.setValue('');
        this.dogForm.get('microchip_vendor')?.disable();
        this.dogForm.get('microchip_vendor')?.clearValidators();
      }
      this.dogForm.get('microchip_vendor')?.updateValueAndValidity();
    });

    this.dogForm.get('surrendered_by_animal_control')?.valueChanges.subscribe((isFromAnimalControl) => {
      const phoneControl = this.dogForm.get('surrenderer_phone');
      if (isFromAnimalControl) {
        phoneControl?.clearValidators();
        phoneControl?.setValidators([Validators.maxLength(15), Validators.required, Validators.pattern(/^[0-9]*$/)]);
      } else {
        phoneControl?.clearValidators();
        phoneControl?.setValidators([Validators.maxLength(15), Validators.pattern(/^[0-9]*$/)]);
      }
      phoneControl?.updateValueAndValidity();
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

  get vendorNameControl() {
    return this.dogForm.get('microchip_vendor');

  }

  getBreedsList(): void {
    this.service.getBreedList().subscribe(breeds => {
      this.breedsList = breeds;
    });
  }

  getVendorsList(): void {
    this.service.getMicrochipVendorsList().subscribe(vendors => {
      this.vendorList = vendors;
    });
  }

  onBreedsChange(event: any): void {
    const selectedBreeds: string[] = event.value;
    this.validateBreedsSelection(selectedBreeds);
  }

  get selectedBreedsDisplay(): string {
    const selectedBreeds = this.breedControl?.value;
    return selectedBreeds.length ? selectedBreeds.join('/') : 'Select breeds';
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

  onSubmit(): void {
    if (this.dogForm.valid) {
      const formData = this.dogForm.value;
      const surrenderDate = formData.surrender_date;
      if (surrenderDate) {
        const dateObj = new Date(surrenderDate);
        formData.surrender_date = dateObj.toISOString().split('T')[0];
      }
      if (formData.name.toLowerCase() === 'uga' && formData.breeds.includes('Bulldog')) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name cannot be Uga with breed Bulldog.' });
        return;
      }
      this.addDog(formData);
    }
  }

  addDog(formData: any): void {
    this.service.addDog(formData).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dog added successfully!' });
        this.promptNavigation(response.data);
      },
      error: (error) => {
        console.error('Error adding dog:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error || 'Failed to add dog.' });
      }
    });
  }

  promptNavigation(dogID: number): void {
    if (confirm('Dog added successfully. Redirect to Dog Dashboard or Dog Details?')) {
      this.router.navigate(['/dog-details', dogID]);
    } else {
      this.router.navigate(['/dog-dashboard']);
    }
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }

  formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
