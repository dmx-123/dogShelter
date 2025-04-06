import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';
import { Dog } from '../model/Dog';
import { ApprovedApplication } from '../model/ApprovedApplication';
import { ExpenseSummary } from '../model/ExpenseSummary';
import { DogDetails } from '../model/DogDetails';

@Component({
  selector: 'app-adoption-confirmation-dialog',
  templateUrl: './adoption-confirmation-dialog.component.html',
  styleUrl: './adoption-confirmation-dialog.component.css'
})
export class AdoptionConfirmationDialogComponent implements OnInit {
  adopter!: Adopter;
  dogDetails!: DogDetails

  dog!: Dog;
  adoption_fee: number = 0;
  adoption_date!: Date;
  isFeeWaived: boolean = false;
  application!: ApprovedApplication;
  constructor(
    public dialogRef: MatDialogRef<AdoptionConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private service: DogService, private messageService: MessageService) { }


  ngOnInit(): void {
    this.adopter = this.data.adoptionDetails.adopter;
    this.application = this.data.adoptionDetails.application;
    this.service.currentDog.subscribe(details => {
      if (details) {
        this.dogDetails = details;
        this.dog = details.dog;
      }
    });
    this.adoption_date = this.data.adoptionDetails.adoption_date;
    this.adoption_fee = this.data.adoptionDetails.adoption_fee;
    this.isFeeWaived = this.data.adoptionDetails.isFeeWaived;
  }

  submitAdoption(): void {
    const payload = {
      dogID: this.dog.dogID,
      email: this.application.email,
      adoption_date: this.formatDate(this.adoption_date),
      submit_date: this.formatDate(this.application.submit_date)
    };
    this.service.submitApplication(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Adoption recorded successfully!' });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error });
      }
    });
  }

  formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
