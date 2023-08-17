import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  displayName!: string;
  userCreated = false;
  userExists = false;
  checked!: FormControl;  
  chooseAvatar: boolean = false;
  selectedAvatarURL!: string;
  avatarUrls: string[] = [];
  defaultAvatar: string = '../../assets/img/default_avatar.svg';


  constructor(
    private authService: AuthService,
    private router: Router) { }


  ngOnInit(): void {
    this.checked = new FormControl(false, Validators.requiredTrue);
    this.signupForm = new FormGroup({
      displayName: new FormControl(null, [Validators.required, this.fullNameValidator]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
      checked: this.checked 
    });

    const displayNameControl = this.signupForm.get('displayName');
    if (displayNameControl) {
      displayNameControl.valueChanges.subscribe(value => {
        this.displayName = value;
      });
    }
    
    this.avatarUrls = this.authService.user_images;
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
    this.authService.signUp(displayName, email, password, this.selectedAvatarURL)
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


  onNextClick(): void {
    this.chooseAvatar = true;
  }


  onbackClick() {
    this.chooseAvatar = false;
  }


  selectAvatar(url: string) {
    this.selectedAvatarURL = url;
  }



  // This Code down here is for the verification mail function.
  // I will implement this feature later.

  // onSubmit() {
  //   const displayName = this.signupForm.value.displayName;
  //   const email = this.signupForm.value.email;
  //   const password = this.signupForm.value.password;
  //   this.authService.signUp(displayName, email, password)
  //     .then(() => {
  //       this.authService.sendVerificationMail()
  //         .then(() => {
  //           this.emailSent = true;
  //           setTimeout(() => {
  //             this.router.navigate(['/login']);
  //           }, 3000);
  //         })
  //         .catch((error: { message: string; }) => {
  //           console.error('Failed to send verification email:', error);
  //         });
  //     })
  //     .catch((error: { message: string; }) => {
  //       console.log(error); // Firebase error in the console.
  //       this.userExists = true;
  //       this.signupForm.controls['email'].reset();
  //       setTimeout(() => {
  //         this.userExists = false;
  //       }, 3000);
  //     });
  // }
}
