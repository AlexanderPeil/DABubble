import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent implements OnInit, OnDestroy {
  user?: User;
  isOnline?: boolean;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        this.authService.getUserData(firebaseUser.uid).subscribe(userData => {
          this.user = userData;
          this.isOnline = userData.isOnline;
        });
      }
    });
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogEditProfileComponent, {
      width: '600px',
      height: '650px',
      panelClass: 'custom-dialog-container'
    });
  }
  


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}