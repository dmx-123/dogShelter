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
  surrenderDate!: Date;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private http: HttpClient, private service: DogService, private messageService: MessageService) { }

  afterSurrenderDateValidator = (control: any) => {
    if(!this.surrenderDate || !control.value) return null;

    const inputDate = new Date(control.value);
    const surrenderDate = new Date(this.surrenderDate);
    surrenderDate.setHours(0, 0, 0, 0);    // ensure date-only comparison
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= surrenderDate?{beforeSurrenderDate: true}:null;
  }

  ngOnInit(): void {
    this.dogID = Number(this.route.snapshot.paramMap.get('dogID'));

    const surrenderDateParam = this.route.snapshot.queryParamMap.get('surrenderDate');
    if(surrenderDateParam){
      this.surrenderDate = new Date(surrenderDateParam);
    }

    this.expenseForm = this.fb.group({
      dogID: [this.dogID, Validators.required],
      category_name: ['', Validators.required],
      vendor_name: ['', Validators.required],
      date: ['', [Validators.required, this.afterSurrenderDateValidator]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/) // Only numbers with up to 2 decimals
      ]]
    });
    this.getCategories();

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
