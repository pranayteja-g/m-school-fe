import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { EmployeeDashboardComponent } from './pages/employee-dashboard/employee-dashboard.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { StudentComponent } from './pages/student/student.component';
import { FeesComponent } from './pages/fees/fees.component';
import { ExamresultsComponent } from './pages/examresults/examresults.component';
import { SalaryComponent } from './pages/salary/salary.component';

export const routes: Routes = [

    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "forbidden", component: ForbiddenComponent },
    { path: "m-employee", component: EmployeeComponent },
    { path: "m-student", component: StudentComponent },
    { path: "m-fees", component: FeesComponent },
    { path: "m-results", component: ExamresultsComponent, canActivate: [authGuard], data: { role: ['ROLE_ADMIN', 'ROLE_EMPLOYEE'] } },
    { path: "m-salary", component: SalaryComponent },

    {
        path: "admindashboard",
        component: AdminDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_ADMIN' }
    },
    {
        path: "studentdashboard",
        component: StudentDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_STUDENT' }
    },
    {
        path: "employeedashboard",
        component: EmployeeDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_EMPLOYEE' }
    }

];
