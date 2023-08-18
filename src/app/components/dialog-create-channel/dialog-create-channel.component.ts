import { Component, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserToChannelComponent } from '../dialog-add-user-to-channel/dialog-add-user-to-channel.component';
import { ChannelService } from 'src/app/shared/services/channel.service';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss'],
})
export class DialogCreateChannelComponent {
  channel: Channel = new Channel();

  constructor(
    private channelService: ChannelService,
    public dialog: MatDialog
  ) { }

  openDialogToAddAllOrSpecificUsers(channel: any) {
    this.channelService.addChannelService(channel);
    this.dialog.open(DialogAddUserToChannelComponent);
  }
}
