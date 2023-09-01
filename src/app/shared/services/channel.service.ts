import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channelData!: Observable<any>;
  channel: any = new Channel();

  constructor(private firestore: Firestore) {}

  addChannelService(channel: any) {
    const collectionInstance = collection(this.firestore, 'channels');
    addDoc(collectionInstance, channel.toJSON());
  }

  getChannelService() {
    const collectionInstance = query(
      collection(this.firestore, 'channels'),
      orderBy('channelName')
    );
    this.channelData = collectionData(collectionInstance, { idField: 'id' });
  }

  updateChannelNameService(changedChannelName: string, channelId: string) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    const updateData = {
      channelName: changedChannelName,
    };
    updateDoc(docInstance, updateData);
    window.location.reload();
  }

  updateChannelDescriptionService(
    changedChannelDescription: string,
    channelId: string
  ) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    const updateData = {
      channelDescription: changedChannelDescription,
    };
    updateDoc(docInstance, updateData);
    window.location.reload();
  }

  deleteChannelService(channelId: string) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    deleteDoc(docInstance).then(() => {
      console.log('Document deleted');
    });
  }

  getSingleChannelService(channelId: string) {
    const collectionInstance = collection(this.firestore, 'channels');
    const docRef = doc(collectionInstance, channelId);
    getDoc(docRef).then((doc) => {
      this.channel = doc.data();
    });
  }
}
