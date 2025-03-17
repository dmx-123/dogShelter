import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.css'
})
export class ViewReportsComponent {
  constructor(private router: Router) {}

  navigateToReport(route: string) {
    this.router.navigate([route]);
  }
}
