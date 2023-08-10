import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-edit-profile',
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.scss']
})
export class DialogEditProfileComponent implements OnInit, OnDestroy {
  user?: User;
  userForm!: FormGroup;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder) { }


  ngOnInit() {
    this.initForm();

    this.userSubscription = this.authService.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        this.authService.getUserData(firebaseUser.uid).subscribe(userData => {
          this.user = userData;
          this.userForm.patchValue(userData);
        });
      }
    });
  }


  private initForm() {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }


  onSubmit() {

  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
