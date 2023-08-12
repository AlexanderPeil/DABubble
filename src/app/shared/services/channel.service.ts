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
  providedIn: 'root'
})
export class ChannelService {
  private channelCollection = collection(this.firestore, 'channels');

  constructor(private firestore: Firestore) { }

  createChannel(channel: Channel) {
    return addDoc(this.channelCollection, channel.toJSON());
  }
}
