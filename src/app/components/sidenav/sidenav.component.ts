import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  constructor(
    public dialog: MatDialog,
    private authService: AuthService) { }

  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;
  user: User | null = null;
  userSubscription!: Subscription;
  isOnline?: boolean;


  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        console.log(firebaseUser.uid);
        this.authService.getUserData(firebaseUser.uid).subscribe(userData => {
          this.user = userData;
          this.isOnline = userData.isOnline;
        });
      }
    });
  }


  hideChannels() {
    this.channelsVisible = !this.channelsVisible;
    this.arrowImageRotatedChannel = !this.arrowImageRotatedChannel;
  }


  hideChats() {
    this.chatsVisible = !this.chatsVisible;
    this.arrowImageRotatedChat = !this.arrowImageRotatedChat;
  }

  openDialogToCreateChannel() {
    this.dialog.open(DialogCreateChannelComponent);
  }
}
