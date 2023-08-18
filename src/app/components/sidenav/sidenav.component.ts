import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private channelService: ChannelService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
  ) { }

  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;
  users: User[] = [];
  userSubscription!: Subscription;
  isOnline?: boolean;
  channelData!: Observable<any>;
  channelId: any = '';

  ngOnInit() {
    this.authService.getUsers().subscribe((users) => {
      this.users = users;
    });
    this.activatedRoute.paramMap.subscribe((params) => {
      this.channelId = params.get('id');
    });
    this.channelService.getChannelService();
    this.channelData = this.channelService.channelData;
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
}