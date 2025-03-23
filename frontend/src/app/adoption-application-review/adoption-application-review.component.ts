import { Component, OnInit } from '@angular/core';
import { DogService } from '../services/dog-service.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AdoptionApplication } from '../model/AdoptionApplication';

@Component({
  selector: 'app-adoption-application-review',
  templateUrl: './adoption-application-review.component.html',
  styleUrl: './adoption-application-review.component.css'
})
export class AdoptionApplicationReviewComponent implements OnInit {
  pendingApplications: AdoptionApplication[] = [];
  displayedColumns: string[] = ['email', 'name', 'phone', 'household_size', 'address', 'submit_date', 'actions'];

  constructor(private service: DogService, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.getPendingApplications();
  }

  getPendingApplications(): void {
    this.service.getPendingApplications().subscribe({
      next: (data) => {
        this.pendingApplications = data;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading pending applications.', sticky: true });
      }
    });
  }

  approveApplication(submit_date: string, email: string): void {
    this.service.approveApplication(submit_date,email).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application approved.' });
        this.getPendingApplications();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error approving application.', sticky: true });
      }
    });
  }

  rejectApplication(submit_date: string, email: string): void {
    this.service.rejectApplication(submit_date,email).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application rejected.' });
        this.getPendingApplications();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error rejecting application.', sticky: true });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}