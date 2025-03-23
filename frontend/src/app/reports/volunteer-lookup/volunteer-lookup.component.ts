import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DogService } from '../../services/dog-service.service';

@Component({
  selector: 'app-volunteer-lookup',
  templateUrl: './volunteer-lookup.component.html',
  styleUrl: './volunteer-lookup.component.css'
})
export class VolunteerLookupComponent {
  searchForm: FormGroup;
  dataSource: any[] = [];
  displayedColumns: string[] = ['first_name', 'last_name', 'email', 'phone_number'];
  noData: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private service: DogService) {
    this.searchForm = this.fb.group({
      name: ['']
    });
  }

  onSearch(): void {
    const name = this.searchForm.get('name')?.value.trim();
    if (!name) return;

    this.service.lookupVolunteers(name).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.dataSource = data;
        this.noData = data.length === 0;
      },
      error: err => {
        this.noData = true;
        this.dataSource = [];
        console.error('Error searching volunteers', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }
}
