import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewReportsComponent } from './view-reports/view-reports.component';
import { AddDogComponent } from './add-dog/add-dog.component';
import { DogDashboardComponent } from './dog-dashboard/dog-dashboard.component';
import { AdoptionApplicationReviewComponent } from './adoption-application-review/adoption-application-review.component';
import { MonthlyAdoptionReportComponent } from './reports/monthly-adoption-report/monthly-adoption-report.component';
import { ExpenseAnalysisComponent } from './reports/expense-analysis/expense-analysis.component';
import { VolunteerLookupComponent } from './reports/volunteer-lookup/volunteer-lookup.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DogDetailComponent } from './dog-details/dog-details.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ApprovedApplicationDialogComponent } from './approved-application-dialog/approved-application-dialog.component';
import { SearchEligibleAdopterComponent } from './search-eligible-adopter/search-eligible-adopter.component';
import { AdoptionConfirmationDialogComponent } from './adoption-confirmation-dialog/adoption-confirmation-dialog.component';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AddAdoptionApplicationComponent } from './add-adoption-application/add-adoption-application.component';
import { VolunteerBirthdayReportComponent } from './reports/volunteer-birthday-report/volunteer-birthday-report.component';
import { AnimalControlDrilldownComponent } from './reports/animal-control-drilldown/animal-control-drilldown.component';
import { AnimalControlReportComponent } from './reports/animal-control-report/animal-control-report.component';
import { AuthInterceptor } from './auth.interceptor';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    DogDashboardComponent,
    ViewReportsComponent,
    AddDogComponent,
    AddExpenseComponent,
    DogDashboardComponent,
    AdoptionApplicationReviewComponent,
    AnimalControlReportComponent,
    MonthlyAdoptionReportComponent,
    ExpenseAnalysisComponent,
    VolunteerLookupComponent,
    VolunteerBirthdayReportComponent,
    DogDetailComponent,
    SearchEligibleAdopterComponent,
    ApprovedApplicationDialogComponent,
    AdoptionConfirmationDialogComponent,
    AddAdoptionApplicationComponent,
    AnimalControlDrilldownComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    MatSortModule,
    HttpClientModule,
  ],
  providers: [
    MessageService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
