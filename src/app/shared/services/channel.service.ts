import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  query,
  deleteDoc,
  onSnapshot,
  limit,
  getDocs,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channelData!: Observable<any>;
  channel: any = new Channel();


  constructor(private firestore: Firestore, public route: Router) {

  }


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

  updateChannelNameService(changedChannelName: any, channelId: string) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    const updateData = {
      channelName: changedChannelName,
    };
    updateDoc(docInstance, updateData);
    onSnapshot(docInstance, (doc) => {
      this.channel = doc.data();
    });
  }

  updateChannelDescriptionService(changedChannelDescription: string, channelId: string) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    const updateData = {
      channelDescription: changedChannelDescription,
    };
    updateDoc(docInstance, updateData);
    onSnapshot(docInstance, (doc) => {
      this.channel = doc.data();
    });
  }

  deleteChannelService(channelId: string) {
    const docInstance = doc(this.firestore, 'channels', channelId);
    deleteDoc(docInstance).then(() => {
      console.log('Document deleted');
    });
    this.navigateToOthersChannelAsSoonAsDeleteService();
  }


  navigateToOthersChannelAsSoonAsDeleteService() {
    const querie = query(collection(this.firestore, 'channels'), orderBy('channelName'));
    getDocs(querie).then((querySnapshot) => {
      if (querySnapshot.empty) {
        this.route.navigate(['/main']);
      } else {
        this.route.navigate(['/main/channel/', querySnapshot.docs[0].id]);
      }
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
