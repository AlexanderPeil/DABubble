import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isOnline?: boolean;
  private userSubscription?: Subscription;
  user_images = '../assets/img/avatar1.svg';

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogProfileComponent>) { }


  ngOnInit() {
    this.userSubscription = this.authService.user$
      .pipe(
        tap(firebaseUser => {
          if (!firebaseUser?.uid) {
            this.user = null;
            this.isOnline = undefined;
          }
        }),
        switchMap(firebaseUser =>
          firebaseUser?.uid ? this.authService.getUserData(firebaseUser.uid) : []
        )
      )
      .subscribe(userData => {
        this.user = userData ?? null;
        this.isOnline = userData?.isOnline ?? undefined;
      });
  }


  retryLoadImage() {
    if (this.user) {
      this.user.photoURL = this.user_images;
    }
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogEditProfileComponent, {
      width: '600px',
      height: '650px',
      panelClass: 'custom-dialog-container'
    });
    this.dialogRef.close();
  }



  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}