import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';
import { Dog } from '../model/Dog';

@Component({
  selector: 'app-approved-application-dialog',
  templateUrl: './approved-application-dialog.component.html',
  styleUrl: './approved-application-dialog.component.css'
})
export class ApprovedApplicationDialogComponent implements OnInit {
  adoptionForm: FormGroup;
  adopter!: Adopter;
  dog!: Dog;
  adoptionFee: number = 0;
  latestApplication: any;
  todayDate = new Date(new Date().toLocaleDateString());

  constructor(public dialogRef: MatDialogRef<ApprovedApplicationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private service: DogService
  ) {
    this.adoptionForm = this.fb.group({
      adoption_date: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.service.currentDog.subscribe(dog => {
      this.dog = dog;
    });
    this.adopter = this.data.adopter;
    this.loadLatestApplication();
  }

  loadLatestApplication(): void {
    this.service.getLatestApprovedApplication(this.adopter.email).subscribe((application) => {
      if (application) {
        this.latestApplication = application;
        this.adoptionFee = 0;
      } else {
        console.warn('No approved application found for this email.');
      }
    });
  }

  confirmAdoption(): void {
    if (this.adoptionForm.invalid) return;

    const adoptionDetails = {
      adopter: this.adopter,
      application: this.latestApplication,
      adoption_date: this.adoptionForm.value.adoption_date,
      adoption_fee: this.adoptionFee
    };

    this.dialogRef.close({ confirmed: true, adoptionDetails });
  }
}

