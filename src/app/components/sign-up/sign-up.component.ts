import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
  signupForm!: FormGroup;
  displayName!: string;
  userCreated = false;
  userExists = false;
  checked!: FormControl;
  chooseAvatar: boolean = false;
  selectedAvatarURL!: string;
  avatarUrls: string[] = [];
  defaultAvatar: string = '../../assets/img/default_avatar.svg';
  private displayNameSubscription?: Subscription;


  constructor(
    private authService: AuthService,
    private router: Router,
    public storageService: StorageService) { }


  ngOnInit(): void {
    this.checked = new FormControl(false, Validators.requiredTrue);
    this.signupForm = new FormGroup({
      displayName: new FormControl(null, [Validators.required, this.fullNameValidator]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
      passwordConfirm: new FormControl(null, Validators.required),
      checked: this.checked
    }, { validators: Validators.compose([this.passwordsMatchValidator.bind(this)]) });
    this.subscribeDisplayName();
    this.avatarUrls = this.authService.user_images;
  }


  subscribeDisplayName() {
    const displayNameControl = this.signupForm.get('displayName');
    if (displayNameControl) {
      this.displayNameSubscription = displayNameControl.valueChanges.subscribe(value => {
        this.displayName = value;
      });
    }
  }


  fullNameValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const words = control.value ? control.value.split(' ') : [];
    if (words.length < 2 || words[words.length - 1] === '') {
      return { 'invalidFullName': true };
    }
    return null;
  }


  passwordsMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = (formGroup.get('password') as FormControl)?.value;
    const passwordConfirm = (formGroup.get('passwordConfirm') as FormControl)?.value;

    if (password !== passwordConfirm) {
      return { passwordsMismatch: true };
    }
    return null;
  }


  onSubmit() {
    if (this.signupForm.invalid) {
      console.error("Form is invalid, can't proceed with registration");
      return;
    }
    this.authServiceCall();
  }


  authServiceCall() {
    const displayName = this.signupForm.value.displayName;
    const email = this.signupForm.value.email;
    const password = this.signupForm.value.password;
    this.authService.signUp(displayName, email, password, this.selectedAvatarURL)
      .then(() => {
        this.userCreatedFn();
      })
      .catch((error: { message: string; }) => {
        this.signUpFail(error);
      });
  }


  userCreatedFn() {
    this.userCreated = true;
    setTimeout(() => {
      this.router.navigate(['/main/channel/tcgLB0MdDpTD27cGTU95']);
    }, 3000);
  }


  signUpFail(error: any) {
    console.log(error);
    this.userExists = true;
    this.signupForm.controls['email'].reset();
    setTimeout(() => {
      this.userExists = false;
    }, 3000);
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


  chooseFiletoUpload($event: any) {
    this.storageService.uploadAvatarService($event).then((url: string) => {
      this.selectedAvatarURL = url;
    }).catch((error: any) => {
      console.error("Error uploading file: ", error);
    });
  }


  ngOnDestroy(): void {
    if (this.displayNameSubscription) {
      this.displayNameSubscription.unsubscribe();
    }
  }

}
