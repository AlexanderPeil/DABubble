import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, collectionData } from '@angular/fire/firestore';
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
    return collectionData(messageCollection).pipe(
      map(docs => docs.map(doc => new DirectMessageContent(doc)))
    );
  }
}
