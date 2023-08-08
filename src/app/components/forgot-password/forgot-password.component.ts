import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  sendMailForm!: FormGroup;
  emailSent = false;
  emailSendFailed = false;
  errorMessage!: string;

  constructor(
    private authService: AuthService,
    private router: Router) { }


  ngOnInit() {
    this.sendMailForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
  }


  onSubmit() {
    const email = this.sendMailForm.value.email;
    this.authService.forgotPassword(email)
      .then(() => {
        this.emailSent = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      })
      .catch((error: { message: string; }) => {
        console.log(error); // Firebase error in the console.
        this.emailSendFailed = true;
        this.sendMailForm.controls['email'].reset();
        setTimeout(() => {
          this.emailSendFailed = false;
        }, 3000);
      });
  }

}
