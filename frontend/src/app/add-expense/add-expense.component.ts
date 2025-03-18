import { Component, OnInit } from '@angular/core';
import { DogService } from '../services/dog-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit {
  dogID: string | null = null;
  constructor(private route: ActivatedRoute, private service:DogService) { }

  ngOnInit(): void {
    this.dogID = this.route.snapshot.paramMap.get('dogID');
  }
}
