import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    public channelService: ChannelService,
    private router: Router,
    private directMessageService: DirectMessageService,
  ) { }


  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;
  users: { user: User, unreadCount?: number }[] = [];
  userSubscription!: Subscription;
  isOnline?: boolean;
  unreadMessagesCount$!: Observable<number>;
  loggedInUser: User | null = null;



  ngOnInit() {
    this.authService.getUsers().subscribe((usersData) => {
      this.users = usersData.map(user => ({ user, unreadCount: 0 }));
      this.users.forEach((userWithCount, index) => {
        const loggedInUid = this.authService.currentUserValue?.uid;
        if (loggedInUid) {
          this.directMessageService.getUnreadMessagesCount(loggedInUid, userWithCount.user.uid)
            .subscribe(unreadCount => {
              this.users[index].unreadCount = unreadCount;
            });
        }
      });
    });
    this.channelService.getChannelService();
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


  onUserClick(userWithCount: { user: User, unreadCount?: number }) {
    const loggedInUid = this.authService.currentUser.value?.uid; 
    if (loggedInUid && userWithCount.unreadCount && userWithCount.unreadCount > 0) {
      this.directMessageService.markAllMessagesAsRead(loggedInUid, userWithCount.user.uid).then(() => {
        userWithCount.unreadCount = 0; // Setzen Sie den Zähler zurück
      });
    }
    this.router.navigate(['main', 'direct-message', userWithCount.user.uid]);
  } 


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}