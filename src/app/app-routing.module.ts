import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ImprintComponent } from './components/imprint/imprint.component';
import { DataProtectionComponent } from './components/data-protection/data-protection.component';
import { MainComponent } from './components/main/main.component';
import { DirectMessageComponent } from './components/direct-message/direct-message.component';
import { ChannelComponent } from './components/channel/channel.component';
import { NewMessageComponent } from './components/new-message/new-message.component';
import { ThreadComponent } from './components/thread/thread.component';
import { AuthGuard } from './shared/services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'channel/tcgLB0MdDpTD27cGTU95',
        pathMatch: 'full',
      },
      {
        path: 'channel/:id',
        component: ChannelComponent,
        children: [
          { path: 'thread/:messageId/:channelId', component: ThreadComponent },
        ],
      },
      {
        path: 'direct-message/:id',
        component: DirectMessageComponent,
        children: [{ path: 'thread/:messageId', component: ThreadComponent }],
      },
      { path: 'new-message', component: NewMessageComponent },
    ],
  },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'data-protection', component: DataProtectionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
