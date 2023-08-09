import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatHistoryComponent } from './components/chat-history/chat-history.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ImprintComponent } from './components/imprint/imprint.component';
import { DataProtectionComponent } from './components/data-protection/data-protection.component';


const routes: Routes = [
  { path: '', component: ChatHistoryComponent },
  { path: 'chat-history', component: ChatHistoryComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'data-protection', component: DataProtectionComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
