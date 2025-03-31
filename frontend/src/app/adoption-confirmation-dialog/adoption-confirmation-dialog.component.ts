import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';
import { Dog } from '../model/Dog';
import { ApprovedApplication } from '../model/ApprovedApplication';

@Component({
  selector: 'app-adoption-confirmation-dialog',
  templateUrl: './adoption-confirmation-dialog.component.html',
  styleUrl: './adoption-confirmation-dialog.component.css'
})
export class AdoptionConfirmationDialogComponent implements OnInit {
  adopter!: Adopter;
  dog!: Dog;
  adoption_fee: number = 0;
  adoption_date!: Date;
  application!: ApprovedApplication;
  constructor(
    public dialogRef: MatDialogRef<AdoptionConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private service: DogService, private messageService: MessageService) { }


  ngOnInit(): void {
    this.adopter = this.data.adoptionDetails.adopter;
    this.service.currentDog.subscribe(dog => {
      this.dog = dog;
    });
    this.adoption_date = this.data.adoptionDetails.adoption_date;
    this.adoption_fee = this.data.adoptionDetails.adoption_fee;
  }

  submitAdoption(): void {
    this.application.dogID = this.dog.dogID;
    this.application.adoption_date = this.adoption_date;
    this.service.addAdoptionApplication(this.application).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Adoption recorded successfully!' });
        this.dialogRef.close(true);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error recording adoption. Try again.' });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
