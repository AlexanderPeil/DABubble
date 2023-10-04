import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Observable, Subscription, take, tap } from 'rxjs';
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
  users: User[] = [];
  userSubscription!: Subscription;
  isOnline?: boolean;
  loggedInUser: Observable<User | null> = this.authService.currentUser.asObservable();
  user_images = '../assets/img/avatar1.svg';


  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    public channelService: ChannelService,
    private router: Router,
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    this.userSubscription = this.authService.getUsers().subscribe(users => this.users = users);
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


  onUserClick(clickedUser: User) {
    this.loggedInUser.pipe(
      take(1),
      tap(loggedInUser => {
        if (loggedInUser && loggedInUser.uid !== clickedUser.uid) {
          if (loggedInUser.hasUnreadMessages?.includes(clickedUser.uid)) {
            this.messageService.markMessagesAsRead(clickedUser.uid, loggedInUser.uid);
          }
        }
      })
    ).subscribe();

    this.router.navigate(['main', 'direct-message', clickedUser.uid]);
  }


  onChannelClick(channelId: string) {
    this.messageService.markChannelMessageAsRead(channelId);
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}