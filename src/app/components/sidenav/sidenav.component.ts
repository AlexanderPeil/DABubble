import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  constructor(public dialog: MatDialog) {}

  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotatedChannel: boolean = false;
  arrowImageRotatedChat: boolean = false;

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
