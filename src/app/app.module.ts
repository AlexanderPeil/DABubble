import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { HeaderComponent } from './components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatHistoryComponent } from './components/chat-history/chat-history.component';
import { LoginComponent } from './components/login/login.component';
import { MessageComponent } from './components/message/message.component';
import { TextfieldInChathistoryComponent } from './components/textfield-in-chathistory/textfield-in-chathistory.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ThreadComponent } from './components/thread/thread.component';
import { TextfieldInThreadComponent } from './components/textfield-in-thread/textfield-in-thread.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogEditChannelComponent } from './components/dialog-edit-channel/dialog-edit-channel.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogProfileComponent } from './components/dialog-profile/dialog-profile.component';
import { DialogEditProfileComponent } from './components/dialog-edit-profile/dialog-edit-profile.component';
import { ImprintComponent } from './components/imprint/imprint.component';
import { DataProtectionComponent } from './components/data-protection/data-protection.component';
import { FormsModule } from '@angular/forms';
import { DialogCreateChannelComponent } from './components/dialog-create-channel/dialog-create-channel.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavComponent,
    ChatHistoryComponent,
    LoginComponent,
    MessageComponent,
    TextfieldInChathistoryComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ThreadComponent,
    TextfieldInThreadComponent,
    DialogProfileComponent,
    DialogEditProfileComponent,
    ImprintComponent,
    DataProtectionComponent,
    DialogCreateChannelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
