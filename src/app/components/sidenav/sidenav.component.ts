import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';


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
  ) { }


  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;
  users: User[] = [];
  userSubscription!: Subscription;
  isOnline?: boolean;


  ngOnInit() {
    this.authService.getUsers().subscribe((users) => {
      this.users = users;
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


  onUserClick(user: User) {
    this.router.navigate(['main', 'direct-message', user.uid]);
  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}