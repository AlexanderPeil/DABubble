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
import { ChannelService } from 'src/app/shared/services/channel.service';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss'],
})
export class DialogCreateChannelComponent {
  channel: Channel = new Channel();
  showForm = true;
  radioSelected = false;

  constructor(
    private channelService: ChannelService,
    public dialog: MatDialog
  ) {}

  toggleForms() {
    this.showForm = !this.showForm;
  }

  onRadioChange(event: MatRadioChange) {
    this.radioSelected = true;
  }

  onSubmit(channel: any) {
    this.channelService.addChannelService(channel);
  }
}
