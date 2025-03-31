import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DogService } from '../../services/dog-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense-analysis',
  templateUrl: './expense-analysis.component.html',
  styleUrl: './expense-analysis.component.css'
})
export class ExpenseAnalysisComponent implements OnInit {
  displayedColumns: string[] = ['vendor_name', 'total_expense'];
  dataSource: any[] = [];

  constructor(private router: Router, private service: DogService) { }

  ngOnInit(): void {
    this.service.getExpenseAnalysis().subscribe({
      next: (data: any)=> {
        this.dataSource = data.data || [];
      },
      error: (err) => console.error('Error fetching data', err)
    });
    console.log('Data source:', this.dataSource);
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}
