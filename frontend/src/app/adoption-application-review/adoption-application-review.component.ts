import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DogService } from '../services/dog-service.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AdoptionApplication } from '../model/AdoptionApplication';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-adoption-application-review',
  templateUrl: './adoption-application-review.component.html',
  styleUrl: './adoption-application-review.component.css'
})
export class AdoptionApplicationReviewComponent implements OnInit {
  pendingApplications = new MatTableDataSource<AdoptionApplication>();

  displayedColumns: string[] = ['email', 'name', 'phone_number', 'household_size', 'address', 'submit_date', 'actions'];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private service: DogService, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.getPendingApplications();
    this.pendingApplications.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.last_name + ' ' + item.first_name;
        case 'address':
          return item.state + ' ' + item.city + ' ' + item.street;

        default:
          return (item as any)[property];
      }
    };
  }

  getPendingApplications(): void {
    this.service.getPendingApplications().subscribe({
      next: (res) => {
        this.pendingApplications.data = res.data;
        this.pendingApplications.sort = this.sort;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading pending applications.', sticky: true });
      }
    });
  }

  approveApplication(submit_date: string, email: string): void {
    const rawDate = new Date(submit_date);
    const formattedDate = rawDate.toISOString().split('T')[0];

    this.service.approveApplication(formattedDate, email).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application approved.' });
        this.getPendingApplications();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error, sticky: true });
      }
    });
  }

  rejectApplication(submit_date: string, email: string): void {
    const rawDate = new Date(submit_date);
    const formattedDate = rawDate.toISOString().split('T')[0];

    this.service.rejectApplication(formattedDate, email).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application rejected.' });
        this.getPendingApplications();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error, sticky: true });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}