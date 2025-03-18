import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';
import { Dog } from '../model/Dog';

@Component({
  selector: 'approved-application-dialog',
  templateUrl: './approved-application-dialog.component.html',
  styleUrl: './approved-application-dialog.component.css'
})
export class ApprovedApplicationDialogComponent implements OnInit {
  adoptionForm: FormGroup;
  adopter!: Adopter;
  dog!: Dog;
  adoptionFee: number = 0;
  latestApplication: any;

  constructor(public dialogRef: MatDialogRef<ApprovedApplicationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private service: DogService
  ) {
    this.adoptionForm = this.fb.group({
      adoption_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.adopter = this.data.adopter;
    this.loadLatestApplication();
  }

  loadLatestApplication(): void {
    this.service.getLatestApplication(this.adopter.email).subscribe((application) => {
      this.latestApplication = application;
      this.adoptionFee = application.expense;
    });
  }

  confirmAdoption(): void {
    if (this.adoptionForm.invalid) return;

    const adoptionDetails = {
      dog: this.dog,
      adopter: this.adopter,
      application: this.latestApplication,
      adoption_date: this.adoptionForm.value.adoption_date,
      adoption_fee: this.adoptionFee
    };

    this.dialogRef.close({ confirmed: true, adoptionDetails });
  }
}
