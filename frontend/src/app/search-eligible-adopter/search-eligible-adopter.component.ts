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
  selector: 'app-search-eligible-adopter',
  templateUrl: './search-eligible-adopter.component.html',
  styleUrl: './search-eligible-adopter.component.css'
})
export class SearchEligibleAdopterComponent implements OnInit {
  searchForm!: FormGroup;
  displayedColumns: string[] = ['email', 'name', 'phone', 'address'];
  dog!: Dog;
  adoptionForm!: FormGroup;
  adopters: any[] = [];
  selectedAdopter: any | null = null;
  adoptionFee: number = 0;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private service: DogService, private messageService: MessageService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.service.currentDog.subscribe(dog => {
      this.dog = dog;
    });
    this.searchForm = this.fb.group({
      last_name: ['', Validators.required]
    });

    this.adoptionForm = this.fb.group({
      adoption_date: ['']
    });
  }

  onSearch(): void {
    const lastName = this.searchForm.value.last_name;

    this.service.getAdopters(lastName).subscribe({
      next: (data) => {
        this.adopters = data.data;
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
      width: '850px',
      data: {
        adopter: adopter,
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
      width: '850px',
      data: { adoptionDetails }
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }

}