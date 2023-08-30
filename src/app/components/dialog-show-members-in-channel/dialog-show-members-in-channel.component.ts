import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { ChannelService } from 'src/app/shared/services/channel.service';

@Component({
  selector: 'app-dialog-show-members-in-channel',
  templateUrl: './dialog-show-members-in-channel.component.html',
  styleUrls: ['./dialog-show-members-in-channel.component.scss'],
})
export class DialogShowMembersInChannelComponent {
  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    public dialogRef: MatDialogRef<DialogShowMembersInChannelComponent>
  ) {}

  openDialogToAddMembersToChannel() {
    this.dialog.open(DialogAddMembersInChannelComponent);
    this.dialogRef.close();
  }
}
