import { Component, OnInit } from '@angular/core';
import { DogService } from '../../services/dog-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monthly-adoption-report',
  templateUrl: './monthly-adoption-report.component.html',
  styleUrl: './monthly-adoption-report.component.css'
})
export class MonthlyAdoptionReportComponent implements OnInit {
  displayedColumns: string[] = [
    'month', 'breed_label', 'num_surrendered', 'num_adoption',
    'total_expense', 'total_adoption_fee', 'net_profit'
  ];
  dataSource: any[] = [];

  constructor(private router: Router, private service: DogService) { }

  ngOnInit(): void {
    this.service.getMonthlyReport().subscribe({
      next: (res: any) => this.dataSource = res.data || res,
      error: (err) => console.error('Failed to load report', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}
