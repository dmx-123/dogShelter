import { Component, OnInit } from '@angular/core';
import { DogService } from '../../services/dog-service.service';
import { MatDialog } from '@angular/material/dialog';
import { AnimalControlDrilldownComponent } from '../animal-control-drilldown/animal-control-drilldown.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animal-control-report',
  templateUrl: './animal-control-report.component.html',
  styleUrl: './animal-control-report.component.css'
})
export class AnimalControlReportComponent implements OnInit {
  dataSource: any[] = [];
  displayedColumns = ['month', 'surrender', 'sixtyPlus', 'expenses'];

  constructor(private router: Router, private service: DogService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.service.getSummary().subscribe({
      next: res => this.dataSource = res.data || [],
      error: err => console.error('Failed to fetch report', err)
    });
  }

  openDrilldown(type: 'surrender' | 'sixtyPlus' | 'expenses', monthStr: string): void {
    const [year, month] = monthStr.split('-').map(Number);
    console.log('Drilldown for', type, 'month:', monthStr);
    let request$;
    if (type === 'surrender') request$ = this.service.getSurrenders(year, month);
    else if (type === 'sixtyPlus') request$ = this.service.getSixtyPlus(year, month);
    else request$ = this.service.getExpenses(year, month);

    request$.subscribe({
      next: (res) => {
        this.dialog.open(AnimalControlDrilldownComponent, {
          width:'85vw',
          maxWidth: '85vw',
          data: { type, rows: res.data || [], month: monthStr }
        });
      },
      error: err => console.error('Drilldown error', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}