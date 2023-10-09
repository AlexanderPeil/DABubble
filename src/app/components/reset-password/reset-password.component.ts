import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  newPasswordForm!: FormGroup;


  ngOnInit() {
    this.newPasswordForm = new FormGroup({
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required)
    });
    this.newPasswordForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordsMatch();
    });

    this.newPasswordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordsMatch();
    });
  }


  onSubmit() {

  }


  checkPasswordsMatch() {
    const password = this.newPasswordForm.get('password')?.value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.newPasswordForm.get('confirmPassword')?.setErrors({ notMatching: true });
    } else {
      this.newPasswordForm.get('confirmPassword')?.setErrors(null);
    }
  }
}
