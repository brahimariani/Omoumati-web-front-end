import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthRedirectGuard } from '../../core/guards/auth-redirect.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [AuthRedirectGuard]
      },
      { 
        path: 'register', 
        component: RegisterComponent,
        canActivate: [AuthRedirectGuard]
      },
      { 
        path: 'forgot-password', 
        component: ForgotPasswordComponent,
        canActivate: [AuthRedirectGuard]
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { } 