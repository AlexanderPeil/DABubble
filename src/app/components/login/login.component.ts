import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('logoAnimation', [
      state('initial', style({ transform: 'translateX(50%)' })), // leicht rechts positioniert
      state('middle', style({ transform: 'translateX(0%)' })), // Zentriert
      state('final', style({ transform: 'translate(-200%, -390%)' })), // Diagonal nach oben links
      transition('initial => middle', animate('500ms ease-out')),
      transition('middle => final', animate('500ms ease-in-out')),
    ]),
    trigger('nameAnimation', [
      state('hidden', style({ transform: 'translateX(-100%)' })),
      state('visible', style({ transform: 'translateX(0)' })),
      transition('hidden => visible', animate('500ms ease-in')),
    ]),
  ]
})

export class LoginComponent implements OnInit {
  logoState: 'initial' | 'middle' | 'final' = 'initial';
  nameState: 'hidden' | 'visible' = 'hidden';
  background = '#6168ee'; // Start background-color
  logoBackgroundColor = '#6168ee';

  loginForm!: FormGroup;
  loginFailed = false;
  containerVisible = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loginAnimation();
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.authService.signIn(email, password)
        .catch((error: { message: string; }) => {
          this.loginFailed = true;
          this.loginForm.controls['password'].reset();
          setTimeout(() => {
            this.loginFailed = false;
          }, 3000);
          console.log(error);
        });
    }
  }


  onGuestLogin() {
    this.authService.signInAnonymously();
  }


  signInWithGoogle() {
    this.authService.signInWithGoogle().catch(error => {
    });
  }


  loginAnimation() {
    setTimeout(() => {
      this.logoState = 'middle'; 
    }, 500);
    setTimeout(() => {
      this.nameState = 'visible';
    }, 1000); 
    setTimeout(() => {
      this.logoState = 'final'; 
      this.background = 'transparent'; 
      this.logoBackgroundColor = 'transparent'; 
    }, 2000);
    setTimeout(() => {
      this.containerVisible = false; 
    }, 2500); 
  }
  

}
