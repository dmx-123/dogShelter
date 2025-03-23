import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DogService } from '../services/dog-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isAdmin = false;

  constructor(private router: Router, private service: DogService) { }

  ngOnInit(): void {
    this.isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
