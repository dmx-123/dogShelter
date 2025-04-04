import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';
import { Dog } from '../model/Dog';
import { DogDetails } from '../model/DogDetails';
import { Expense } from '../model/Expense';
import { ExpenseSummary } from '../model/ExpenseSummary';

@Component({
  selector: 'app-approved-application-dialog',
  templateUrl: './approved-application-dialog.component.html',
  styleUrl: './approved-application-dialog.component.css'
})
export class ApprovedApplicationDialogComponent implements OnInit {
  adoptionForm: FormGroup;
  adopter!: Adopter;
  dogDetails!: DogDetails
  dog!: Dog;
  expenses!: ExpenseSummary[];
  adoptionFee: number = 0;
  isFeeWaived:boolean = false;
  latestApplication: any;
  todayDate = new Date(new Date().toLocaleDateString());

  constructor(public dialogRef: MatDialogRef<ApprovedApplicationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private service: DogService
  ) {
    this.adoptionForm = this.fb.group({
      adoption_date: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.service.currentDog.subscribe(details => {
      if (details) {
        this.dogDetails = details;
        this.dog = details.dog;
        this.expenses = details.expenses;
        const result = this.getAdoptionFee(this.dog, this.expenses);
        this.adoptionFee = result.fee;   
      }
    });
    this.adopter = this.data.adopter;
    this.loadLatestApplication();
  }

  loadLatestApplication(): void {
    this.service.getLatestApprovedApplication(this.adopter.email).subscribe((application) => {
      if (application) {
        this.latestApplication = application;
        this.adoptionFee =  this.adoptionFee;
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
      adoption_fee: this.adoptionFee,
      isFeeWaived: this.isFeeWaived,
    };

    this.dialogRef.close({ confirmed: true, adoptionDetails });
  }

  getTotalExpenses(expenses: ExpenseSummary[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  getAdoptionFee(dog: Dog, expenses: ExpenseSummary[]): { fee: number, waived: boolean }  {
    const total = this.getTotalExpenses(expenses);

    // Special case: Terrier + name "Sideways"
    const breedList = typeof dog.breeds === 'string' ? dog.breeds.split('/') : dog.breeds;
    const isTerrier = breedList.some((b: string) => b.toLowerCase().includes('terrier'));
    const isSideways = dog.name?.trim().toLowerCase() === 'sideways';
    this.isFeeWaived = isTerrier && isSideways;
    return { 
      fee: total * (dog.surrendered_by_animal_control ? 0.10 : 1.25), 
      waived: isTerrier && isSideways 
    };
  }
}

