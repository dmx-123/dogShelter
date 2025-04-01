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

  columnLabels: { [key: string]: string } = {
    month: 'Month',
    breed_label: 'Breed',
    num_surrendered: '# Surrendered',
    num_adoption: '# Adopted',
    total_expense: 'Total Expense',
    total_adoption_fee: 'Adoption Fee',
    net_profit: 'Net Profit'
  };

  constructor(private router: Router, private service: DogService) { }

  ngOnInit(): void {
    this.service.getMonthlyReport().subscribe({
      next: (res: any) => {
        const groupedData = res.data || res;
        this.dataSource = [];
  
        for (const [month, rows] of Object.entries(groupedData)) {
          this.dataSource.push({ isGroupHeader: true, month });
          this.dataSource.push(...(rows as any[]).map(row => ({ ...row, month })));
        }
      },
      error: (err) => console.error('Failed to load report', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}
