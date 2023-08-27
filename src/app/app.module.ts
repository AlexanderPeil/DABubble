import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from "@angular/fire/storage";
import { HeaderComponent } from './components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
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
import { MatMenuModule } from '@angular/material/menu';
import { DialogProfileComponent } from './components/dialog-profile/dialog-profile.component';
import { DialogEditProfileComponent } from './components/dialog-edit-profile/dialog-edit-profile.component';
import { ImprintComponent } from './components/imprint/imprint.component';
import { DataProtectionComponent } from './components/data-protection/data-protection.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DialogCreateChannelComponent } from './components/dialog-create-channel/dialog-create-channel.component';
import { DialogShowMembersInChannelComponent } from './components/dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { MainComponent } from './components/main/main.component';
import { DialogAddMembersInChannelComponent } from './components/dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { WorkspaceMenuBtnComponent } from './components/workspace-menu-btn/workspace-menu-btn.component';
import { MatRadioModule } from '@angular/material/radio';
import { DirectMessageComponent } from './components/direct-message/direct-message.component';
import { DialogDirectMessageProfileComponent } from './components/dialog-direct-message-profile/dialog-direct-message-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ChannelComponent } from './components/channel/channel.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DialogUploadedDataErrorComponent } from './components/dialog-uploaded-data-error/dialog-uploaded-data-error.component';
import { QuillModule } from 'ngx-quill';
import { QuillConfigModule } from 'ngx-quill/config';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavComponent,
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
    DataProtectionComponent,
    DialogEditChannelComponent,
    DialogShowMembersInChannelComponent,
    MainComponent,
    DialogAddMembersInChannelComponent,
    WorkspaceMenuBtnComponent,
    DirectMessageComponent,
    DialogDirectMessageProfileComponent,
    ChannelComponent,
    DialogUploadedDataErrorComponent,
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
    MatCheckboxModule,
    FormsModule,
    MatMenuModule,
    MatRadioModule,
    PickerComponent,
    MatAutocompleteModule,
    QuillModule,
    QuillConfigModule.forRoot({

    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
