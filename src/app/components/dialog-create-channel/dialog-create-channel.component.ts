import { Component, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss'],
})
export class DialogCreateChannelComponent {
  channel: Channel = new Channel();
  item$: Observable<any[]>;
  firestore: Firestore = inject(Firestore);

  channelName!: string;
  channelDescription!: string;

  constructor() {
    const channelCollection = collection(this.firestore, 'channels');
    this.item$ = collectionData(channelCollection);
  }

  addChannel() {
    const channelCollection = collection(this.firestore, 'channels');

    addDoc(channelCollection, this.channel.toJSON()).then((result) => {
      console.log('Adding user finished', result);
    });
  }
}
