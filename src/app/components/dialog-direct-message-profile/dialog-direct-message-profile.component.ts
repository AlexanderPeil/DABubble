import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'src/app/shared/services/message.service';

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
    @Inject(MAT_DIALOG_DATA) public data: any,
    public messageService: MessageService,) {
    this.selectedUser = data.selectedUser;
  }


  ngOnInit() {
    this.initUser();
    console.log('User status is:', this.user?.isOnline);

  }


  initUser() {
    this.userSubscription = this.authService.currentUser.subscribe(userData => {
      this.user = userData;
      if (userData) {
        // this.isOnline = userData.isOnline ?? false;
        console.log("User online status from subscription:", this.isOnline);
      }
    });
  }



  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}
