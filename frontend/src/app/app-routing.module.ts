import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddDogComponent } from './add-dog/add-dog.component';
import { ExpenseAnalysisComponent } from './reports/expense-analysis/expense-analysis.component';
import { MonthlyAdoptionReportComponent } from './reports/monthly-adoption-report/monthly-adoption-report.component';
import { ViewReportsComponent } from './view-reports/view-reports.component';
import { VolunteerBirthdayReportComponent } from './reports/volunteer-birthday-report/volunteer-birthday-report.component';
import { VolunteerLookupComponent } from './reports/volunteer-lookup/volunteer-lookup.component';
import { DogDashboardComponent } from './dog-dashboard/dog-dashboard.component';
import { DogDetailComponent } from './dog-detaila/dog-details.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { AdoptionApplicationReviewComponent } from './adoption-application-review/adoption-application-review.component';
import { SearchEligibleAdopterComponent } from './search-eligible-adopter/search-eligible-adopter.component';
import { AddAdoptionApplicationComponent } from './add-adoption-application/add-adoption-application.component';
import { AnimalControlReportComponent } from './reports/animal-control-report/animal-control-report.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'dog-dashboard', component: DogDashboardComponent },
  { path: 'dog-details/:dogID', component: DogDetailComponent },
  { path: 'add-expense/:dogID', component: AddExpenseComponent },
  { path: 'view-reports', component: ViewReportsComponent },
  { path: 'add-dog', component: AddDogComponent },
  { path: 'search-eligible-adopter/:dogID', component: SearchEligibleAdopterComponent },
  { path: 'adoption-application-review', component: AdoptionApplicationReviewComponent },
  { path: 'add-adoption-application', component: AddAdoptionApplicationComponent },

  { path: 'animal-control-report', component: AnimalControlReportComponent },
  { path: 'monthly-adoption-report', component: MonthlyAdoptionReportComponent },
  { path: 'expense-analysis', component: ExpenseAnalysisComponent },
  { path: 'volunteer-lookup', component: VolunteerLookupComponent },
  { path: 'volunteer-birthdays', component: VolunteerBirthdayReportComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
