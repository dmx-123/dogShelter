import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DogService } from '../services/dog-service.service';
import { MessageService } from 'primeng/api';
import { ApprovedApplicationDialogComponent } from '../approved-application-dialog/approved-application-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Dog } from '../model/Dog';
import { AdoptionConfirmationDialogComponent } from '../adoption-confirmation-dialog/adoption-confirmation-dialog.component';

@Component({
  selector: 'app-add-adoption',
  templateUrl: './add-adoption.component.html',
  styleUrl: './add-adoption.component.css'
})
export class AddAdoptionComponent implements OnInit {
  searchForm!: FormGroup;
  displayedColumns: string[] = ['email', 'name', 'phone', 'household_size', 'address', 'submit_date'];
  dog!: Dog;
  adoptionForm!: FormGroup;
  adopters: any[] = [];
  selectedAdopter: any | null = null;
  adoptionFee: number = 0;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private service: DogService, private messageService: MessageService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.dog = history.state.dog;
    this.searchForm = this.fb.group({
      last_name: ['', Validators.required]
    });

    this.adoptionForm = this.fb.group({
      adoption_date: ['']
    });
  }

  onSearch(): void {
    const lastName = this.searchForm.value.last_name;

    this.service.getEligibleAdopters(lastName).subscribe({
      next: (data) => {
        this.adopters = data;
        if (this.adopters.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'No Results', detail: 'No eligible adopters found.' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching adopters. Try again.' });
      }
    });
  }

  openApprovedApplicationDialog(adopter: any): void {
    const dialogRef = this.dialog.open(ApprovedApplicationDialogComponent, {
      width: '500px',
      data: {
        adopter: adopter,
        dog: this.dog
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.openAdoptionConfirmationDialog(result.adoptionDetails);
      }
    });
  }

  openAdoptionConfirmationDialog(adoptionDetails: any): void {
    this.dialog.open(AdoptionConfirmationDialogComponent, {
      width: '500px',
      data: { adoptionDetails }
    });
  }
}