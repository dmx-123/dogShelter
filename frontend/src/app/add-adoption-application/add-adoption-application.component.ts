import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DogService } from '../services/dog-service.service';
import { Adopter } from '../model/Adopter';

@Component({
  selector: 'app-add-adoption-application',
  templateUrl: './add-adoption-application.component.html',
  styleUrl: './add-adoption-application.component.css'
})
export class AddAdoptionApplicationComponent implements OnInit {
  adopterForm: FormGroup;
  emailChecked: boolean = false;


  constructor(private fb: FormBuilder, private service: DogService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) {
    this.adopterForm =  this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      first_name: new FormControl({ value: '', disabled: true }, Validators.required),
      last_name: new FormControl({ value: '', disabled: true }, Validators.required),
      phone_number: new FormControl({ value: '', disabled: true }, Validators.required),
      household_size: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.min(1)]),
      street: new FormControl({ value: '', disabled: true }, Validators.required),
      city: new FormControl({ value: '', disabled: true }, Validators.required),
      state: new FormControl({ value: '', disabled: true }, Validators.required),
      zip_code: new FormControl({ value: '', disabled: true }, Validators.required)
    });
  }

  ngOnInit(): void {
    this.adopterForm.get('email')?.valueChanges.subscribe(() => {
      this.emailChecked = false;
      this.resetFormFieldsExceptEmail();
      this.disableFormFields();
    });
  }

  checkEmail() {
    const email = this.adopterForm.get('email')?.value;

    this.service.checkEmailExists(email).subscribe({
      next: (res) => {
        const adopterData = res.data;
        if (adopterData) {
          this.adopterForm.patchValue(adopterData);
          //dont know why but it does not patch value for city
          this.adopterForm.get("city")?.setValue(res.data.city);
          this.emailChecked = true;
          // Disable all except email
          this.disableFormFields();
        
          this.messageService.add({
            severity: 'info',
            summary: 'Adopter Found',
            detail: 'Adopter information auto-filled.',
          });
        } else {
          this.enableFormFields();
        }
      },
      error: (error) => {
        console.error('Error checking email', error);
        this.enableFormFields();
        this.messageService.add({
          severity: 'warn',
          summary: 'Not Found',
          detail: 'Adopter not found. Please enter their information.',
          sticky: true
        });
      }
    });
  }

  disableFormFields(): void {
    Object.keys(this.adopterForm.controls).forEach(field => {
      if (field !== 'email') this.adopterForm.get(field)?.disable();
    });
  }

  enableFormFields(): void {
    Object.keys(this.adopterForm.controls).forEach(field => {
      if (field !== 'email') this.adopterForm.get(field)?.enable();
    });
  }

  resetFormFieldsExceptEmail() {
    Object.keys(this.adopterForm.controls).forEach(key => {
      if (key !== 'email') {
        this.adopterForm.get(key)?.reset();
      }
    });
  }

  // restrict e,+,-,E 
  numericOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      return false;
    }
    return true;

  }
  submitAdopter() {
    if (this.adopterForm.valid) {
      this.service.addAdoptionApplication(this.adopterForm.getRawValue()).subscribe({
        next: (res) => {
          console.log('Success!', res);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application saved successfully' });

        },
        error: (err) => {
          console.error('Error submitting application:', err);
          const errorMessage = err?.error?.error || 'Error saving application. Try again.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage, sticky: true });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dog-dashboard']);
  }

}
