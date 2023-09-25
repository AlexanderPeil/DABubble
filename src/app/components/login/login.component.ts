import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginFailed = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
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
}
