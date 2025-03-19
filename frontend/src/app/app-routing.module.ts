import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddDogComponent } from './add-dog/add-dog.component';
import { AnimalControlReportComponent } from './animal-control-report/animal-control-report.component';
import { ExpenseAnalysisComponent } from './expense-analysis/expense-analysis.component';
import { MonthlyAdoptionReportComponent } from './monthly-adoption-report/monthly-adoption-report.component';
import { ViewReportsComponent } from './view-reports/view-reports.component';
import { VolunteerBirthdaysComponent } from './volunteer-birthdays/volunteer-birthdays.component';
import { VolunteerLookupComponent } from './volunteer-lookup/volunteer-lookup.component';
import { DogDashboardComponent } from './dog-dashboard/dog-dashboard.component';
import { DogDetailComponent } from './dog-detaila/dog-details.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { AdoptionApplicationReviewComponent } from './adoption-application-review/adoption-application-review.component';
import { SearchEligibleAdopterComponent } from './search-eligible-adopter/search-eligible-adopter.component';
import { AddAdoptionApplicationComponent } from './add-adoption-application/add-adoption-application.component';

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
  { path: 'volunteer-birthdays', component: VolunteerBirthdaysComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
