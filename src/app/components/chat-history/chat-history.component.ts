import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogShowMembersInChannelComponent } from '../dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';


@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})


export class ChatHistoryComponent {


  constructor(public dialog: MatDialog) {

  }


  openDialogToEditChannel() {
    this.dialog.open(DialogEditChannelComponent);
  }


  openDialogToShowMembersInChannel() {
    this.dialog.open(DialogShowMembersInChannelComponent);
  }


  openDialogToAddMembersToChannel() {
    this.dialog.open(DialogAddMembersInChannelComponent);
  }
}
