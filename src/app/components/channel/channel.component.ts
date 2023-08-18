import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogShowMembersInChannelComponent } from '../dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';


@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})


export class ChannelComponent {


  constructor(public dialog: MatDialog, public toggleWorspaceMenuService: ToggleWorkspaceMenuService) {

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
