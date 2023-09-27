import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/shared/services/message.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;
  users: { user: User, unreadCount?: number }[] = [];
  userSubscription!: Subscription;
  isOnline?: boolean;
  unreadMessagesCount$!: Observable<number>;
  loggedInUser: User | null = null;
  user_images = '../assets/img/avatar1.svg';


  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    public channelService: ChannelService,
    private router: Router,
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    this.authService.getUsers().subscribe((usersData) => {
      this.users = usersData.map(user => ({ user, unreadCount: 0 }));
      this.users.forEach((userWithCount, index) => {
        const loggedInUid = this.authService.currentUserValue?.uid;
        if (userWithCount.user && loggedInUid) {
          this.messageService.getUnreadMessagesCount(loggedInUid, userWithCount.user.uid)
            .subscribe(unreadCount => {
              if (this.users[index]) {
                this.users[index].unreadCount = unreadCount;
              }
            });
        }
      });
    });
    this.channelService.getChannelService();
  }


  retryLoadImage(user: User) {
    if (user) {
      user.photoURL = this.user_images;
    }
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
      this.messageService.markAllMessagesAsRead(loggedInUid, userWithCount.user.uid).then(() => {
        userWithCount.unreadCount = 0;
      });
    }
    this.messageService.setCurrentChatPartner(userWithCount.user.uid);
    this.router.navigate(['main', 'direct-message', userWithCount.user.uid]);
    console.log(userWithCount.user.uid);
    
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}