import { Component, OnInit } from '@angular/core';
import { DogService } from '../services/dog-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  categories: string[] = [];
  dogID!: number;
  surrender_date: Date = new Date();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private http: HttpClient, private service: DogService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.dogID = Number(this.route.snapshot.paramMap.get('dogID'));
    const surrenderDateParam = this.route.snapshot.queryParamMap.get('surrenderDate');
    if (surrenderDateParam) {
      const [year, month, day] = surrenderDateParam.split('-').map(Number);
      this.surrender_date = new Date(Date.UTC(year, month - 1, day));
    }
    console.log('Parsed surrender date:', this.surrender_date);

    this.expenseForm = this.fb.group({
      dogID: [this.dogID, Validators.required],
      category_name: ['', Validators.required],
      vendor_name: ['', Validators.required],
      date: ['', [Validators.required, this.dateAfterSurrenderValidator(this.surrender_date)]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/) // Only numbers with up to 2 decimals
      ]]
    });
    this.getCategories();

  }

  dateAfterSurrenderValidator(surrenderDate: Date) {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      surrenderDate.setHours(0, 0, 0, 0);
      return selectedDate < surrenderDate ? { dateTooEarly: true } : null;
    };
  }

  getCategories() {
    this.service.getCategoriesList().subscribe(data => {
      this.categories = data;
    })
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const payload = { ...this.expenseForm.value };
      if (payload.date instanceof Date) {
        const year = payload.date.getFullYear();
        const month = String(payload.date.getMonth() + 1).padStart(2, '0');
        const day = String(payload.date.getDate()).padStart(2, '0');
        payload.date = `${year}-${month}-${day}`;
      }

      this.service.addExpense(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense added successfully.' });
          this.router.navigate(['/dog-details', this.dogID]);
        },
        error: err => {
          const errorMessage = err.error?.error || 'Error saving expense. Try again.';
          console.error('Error saving expense:', errorMessage);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage, sticky: true });
        }
      });
    }
  }
  goBack(): void {
    this.router.navigate(['/dog-details', this.dogID]);
  }
}
