import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DogService } from '../services/dog-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted = false;
  serverError: string | null = null;

  constructor(private fb: FormBuilder, private messageService: MessageService, private router: Router, private service: DogService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    this.isSubmitted = true;
    this.serverError = null; 
    const { email, password } = this.loginForm.value;

    if (email === 'admin@test.com' && password === 'password123') {
      const mockResponse = {
        token: 'mock-jwt-token', // Simulated JWT token
        data: {
          isAdmin: true, // ✅ Simulated admin access
          age: 30
        }
      };
  
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('isAdmin', JSON.stringify(mockResponse.data.isAdmin));
      localStorage.setItem('userAge', JSON.stringify(mockResponse.data.age));
      localStorage.setItem('email', email);
  
      this.messageService.add({ severity: 'success', summary: 'Login Successful', detail: 'Redirecting...' });
  
      setTimeout(() => {
        this.router.navigate(['/dog-dashboard']);
      }, 2000);
    } else {
      this.serverError = 'Invalid credentials (Test Mode)';
    }
    // this.service.login(email, password).subscribe({
    //   next: (response) => {
    //     const { token, data } = response;

    //     localStorage.setItem('authToken', token);
    //     localStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));
    //     localStorage.setItem('userAge', JSON.stringify(data.age));

    //     this.messageService.add({ severity: 'success', summary: 'Login Successful', detail: 'Redirecting...' });

    //     setTimeout(() => {
    //       this.router.navigate(['/dog-dashboard']); 
    //     }, 2000);

    //   },
    //   error: (error) => {
    //     this.serverError = error.error.error || 'Invalid credentials';
    //   }
    // });
  }
}
