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


@NgModule({
  declarations: [AppComponent,
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
    TextfieldInThreadComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
