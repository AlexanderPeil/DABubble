import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, collectionData } from '@angular/fire/firestore';
import { DirectMessageContent } from 'src/app/models/direct-message';


@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {

  // private directMessageCollection = collection(this.firestore, 'directMessage');

  constructor(private firestore: Firestore) { }

  async addMessage(userId1: string, userId2: string, message: DirectMessageContent) {
    const chatId = [userId1, userId2].sort().join('_');
    const messageCollection = collection(doc(this.firestore, `directMessage/${chatId}`), 'messages');
    return await addDoc(messageCollection, message.toJSON());
  }


  getDirectMessages(userId1: string, userId2: string) {
    const chatId = [userId1, userId2].sort().join('_');
    const messageCollection = collection(doc(this.firestore, `directMessage/${chatId}`), 'messages');
    return collectionData(messageCollection); 
  }

}
