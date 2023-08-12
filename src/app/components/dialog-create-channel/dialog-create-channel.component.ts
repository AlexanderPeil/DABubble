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
  // item$: Observable<any[]>;
  firestore: Firestore = inject(Firestore);

  channelName!: string;
  channelDescription!: string;

  constructor(private channelService: ChannelService) {
    // const channelCollection = collection(this.firestore, 'channels');
    // this.item$ = collectionData(channelCollection);
  }


  addChannel() {
    const channelCollection = collection(this.firestore, 'channels');
  
    addDoc(channelCollection, this.channel.toJSON()).then((result) => {
      console.log('Channel added', result);
    });
  }

  // addChannel() {
  //   const channelCollection = collection(this.firestore, 'channels');

  //   addDoc(channelCollection, this.channel.toJSON()).then((result) => {
  //     console.log('Adding channel finished', result);
  //   });
  // }
}
