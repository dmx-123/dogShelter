import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DogService } from '../../services/dog-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volunteer-birthday-report',
  templateUrl: './volunteer-birthday-report.component.html',
  styleUrl: './volunteer-birthday-report.component.css'
})
export class VolunteerBirthdayReportComponent implements OnInit {
  birthdayForm: FormGroup;
  months = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' }
  ];

  years = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - 1 + i);
  displayedColumns: string[] = ['first_name', 'last_name', 'email', 'milestone_birthday'];
  dataSource: any[] = [];
  noData: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private service: DogService) {
    const now = new Date();
    this.birthdayForm = this.fb.group({
      month: [now.getMonth() + 1],
      year: [now.getFullYear()]
    });
  }

  ngOnInit(): void {
    this.loadReport();
    this.birthdayForm.valueChanges.subscribe(() => {
      this.loadReport();
    });
  }

  loadReport(): void {
    const { month, year } = this.birthdayForm.value;
    this.service.getBirthdayReport(month, year).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.dataSource = data;
        this.noData = data.length === 0;
      },
      error: err => {
        this.noData = true;
        this.dataSource = [];
        console.error('Error loading report', err);
      }
    });
  }

  onSubmit(): void {
    this.loadReport();
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}