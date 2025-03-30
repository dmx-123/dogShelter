import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DogService } from '../services/dog-service.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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

  constructor(
    private fb: FormBuilder,
    private service: DogService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.dogForm = this.fb.group({
      name: ['', Validators.required],
      sex: ['Unknown', Validators.required],
      description: [''],
      alteration_status: [false, Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      microchipID: [''],
      vendor_name: [{ value: '', disabled: true }],
      breeds: [[], Validators.required],
      surrender_date: ['', Validators.required],
      surrenderer_phone: ['', Validators.required],
      surrendered_by_animal_control: [false]
    });
  }

  ngOnInit(): void {
    this.getBreedsList();
    this.getVendorsList();

    this.dogForm.get('microchipID')?.valueChanges.subscribe(value => {
      if (value) {
        this.dogForm.get('vendor_name')?.enable();
        this.dogForm.get('vendor_name')?.setValidators([Validators.required]);
      } else {
        this.dogForm.get('vendor_name')?.disable();
        this.dogForm.get('vendor_name')?.clearValidators();
      }
      this.dogForm.get('vendor_name')?.updateValueAndValidity();
    });
  }

  getBreedsList(): void {
    this.service.getBreedList().subscribe(breeds => {
      this.breedsList = breeds;
    });
  }

  getVendorsList(): void {
    this.service.getVendorsList().subscribe(vendors => {
      this.vendorList = vendors;
    });
  }

  onBreedsChange(event: any): void {
    const selectedBreeds: string[] = event.value;
    const hasMixed = selectedBreeds.includes('Mixed');
    const hasUnknown = selectedBreeds.includes('Unknown');

    if (hasMixed || hasUnknown) {
      this.dogForm.get('breeds')?.setValue([hasMixed ? 'Mixed' : 'Unknown'], { emitEvent: false });
      this.isMixedOrUnknownSelected = true;
    } else {
      this.isMixedOrUnknownSelected = false;
    }
  }

  onSubmit(): void {
    if (this.dogForm.valid) {
      const formData = this.dogForm.value;

      if (formData.name === 'Uga' && formData.breeds.includes('Bulldog')) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name cannot be Uga with breed Bulldog.' });
        return;
      }

      if (formData.microchipID) {
        this.service.checkMicrochipID(formData.microchipID).subscribe(result => {
          if (result.exist > 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Microchip ID already exists.' });
          } else {
            this.addDog(formData);
          }
        });
      } else {
        this.addDog(formData);
      }
    }
  }

  addDog(formData: any): void {
    this.service.addDog(formData).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dog added successfully!' });
        this.promptNavigation(response.dogID);
      },
      error: (error) => {
        console.error('Error adding dog:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error adding dog. Try again.' });
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
}