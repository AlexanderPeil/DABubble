import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channelData!: Observable<any>;
  channel: any = new Channel();


  constructor(private firestore: Firestore) {

  }


  addChannelService(channel: any) {
    const collectionInstance = collection(this.firestore, 'channels');
    addDoc(collectionInstance, channel.toJSON());
  }


  getChannelService() {
    const collectionInstance = collection(this.firestore, 'channels');
    collectionData(collectionInstance, { idField: 'id' });
    this.channelData = collectionData(collectionInstance, { idField: 'id' });
  }


  updateChannelService() {

  }


  deleteChannelService() {

  }


  getSingleChannelService(channelId: string) {
    const collectionInstance = collection(this.firestore, 'channels');
    const docRef = doc(collectionInstance, channelId);
    getDoc(docRef).then((doc) => {
      this.channel = doc.data();
    });
  }
}