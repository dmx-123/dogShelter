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

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private http: HttpClient, private service: DogService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.dogID = Number(this.route.snapshot.paramMap.get('dogID'));

    this.expenseForm = this.fb.group({
      dogID: [this.dogID, Validators.required],
      category_name: ['', Validators.required],
      vendor_name: ['', Validators.required],
      date: ['', Validators.required],
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
      this.service.saveExpense(this.expenseForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense added successfully.' });
          this.router.navigate(['/dog-details', this.dogID]);
        },
        error: err => {
          console.error('Error saving expense:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error saving expense. Try again.', sticky: true });
        }
      });
    }
  }
  goBack(): void {
    this.router.navigate(['/dog-details', this.dogID]);
  }

}
