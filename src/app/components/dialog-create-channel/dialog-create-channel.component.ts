import { Component, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';
import { ChannelService } from 'src/app/shared/services/channel.service';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss'],
})
export class DialogCreateChannelComponent {
  channel: Channel = new Channel();

  channelName!: string;
  channelDescription!: string;

  constructor(private channelService: ChannelService) {}

  addChannel() {
    this.channelService.createChannel(this.channel).then((result) => {
      console.log('Channel added', result);
    });
  }
}
