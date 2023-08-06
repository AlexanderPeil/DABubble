import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  userCreated = false;
  userExists = false;


  constructor(
    private authService: AuthService,
    private router: Router) { }


  ngOnInit(): void {
    this.signupForm = new FormGroup({
      displayName: new FormControl(null, [Validators.required, this.fullNameValidator]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    })
  }


  fullNameValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const words = control.value ? control.value.split(' ') : [];
    if (words.length < 2 || words[words.length - 1] === '') {
      return { 'invalidFullName': true };
    }
    return null;
  }

  onSubmit() {
    const displayName = this.signupForm.value.displayName;
    const email = this.signupForm.value.email;
    const password = this.signupForm.value.password;
    this.authService.signUp(displayName, email, password)
      .then(() => {
        this.userCreated = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      })
      .catch((error: { message: string; }) => {
        console.log(error); // Firebase error in the console.
          this.userExists = true;
          this.signupForm.controls['email'].reset();
          setTimeout(() => {
            this.userExists = false;
          }, 3000);
      });
  }
}
