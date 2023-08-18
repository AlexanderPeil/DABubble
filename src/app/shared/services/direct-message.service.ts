import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, collectionData, updateDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { DirectMessageContent } from 'src/app/models/direct-message';


@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {

  constructor(private firestore: Firestore) { }

  private getMessageCollection(userId1: string, userId2: string) {
    const chatId = this.generateChatId(userId1, userId2);
    return collection(doc(this.firestore, `directMessage/${chatId}`), 'messages');
  }

  private generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }


  async addMessage(userId1: string, userId2: string, message: DirectMessageContent): Promise<void> {
    const messageCollection = this.getMessageCollection(userId1, userId2);
    await addDoc(messageCollection, message.toJSON());
  }


  getDirectMessages(userId1: string, userId2: string): Observable<DirectMessageContent[]> {
    const messageCollection = this.getMessageCollection(userId1, userId2);
    return collectionData(messageCollection, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => new DirectMessageContent(doc)))
    );
  }


  getUnreadMessagesCount(userId1: string, userId2: string): Observable<number> {
    return this.getDirectMessages(userId1, userId2).pipe(
      map(messages => messages.filter(message => !message.read).length)
    );
  }


  async markMessageAsRead(userId1: string, userId2: string, messageId: string): Promise<void> {
    const messageCollection = this.getMessageCollection(userId1, userId2);
    const messageDoc = doc(this.firestore, `directMessage/${this.generateChatId(userId1, userId2)}/messages/${messageId}`);
    await updateDoc(messageDoc, { read: true });
  }

}
