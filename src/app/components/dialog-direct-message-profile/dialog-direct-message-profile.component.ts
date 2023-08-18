import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-direct-message-profile',
  templateUrl: './dialog-direct-message-profile.component.html',
  styleUrls: ['./dialog-direct-message-profile.component.scss']
})
export class DialogDirectMessageProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isOnline?: boolean;
  selectedUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<DialogDirectMessageProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.selectedUser = data.selectedUser;
    }


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


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}
