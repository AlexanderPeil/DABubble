import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channelData!: Observable<any>;
  channel: Channel = new Channel();

  constructor(private firestore: Firestore) {}

  addChannelService(channel: any) {
    const collectionInstance = collection(this.firestore, 'channels');
    addDoc(collectionInstance, channel.toJSON());
  }

  getChannelService() {
    const collectionInstance = collection(this.firestore, 'channels');
    collectionData(collectionInstance, { idField: 'id' });
    this.channelData = collectionData(collectionInstance, { idField: 'id' });
  }

  updateChannelService() {}

  deleteChannelService() {}
}
