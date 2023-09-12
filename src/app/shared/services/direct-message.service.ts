import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  collectionData,
  where,
  getDocs,
  writeBatch,
  query
} from '@angular/fire/firestore';
import { Observable, catchError, combineLatest, map, of } from 'rxjs';
import { DirectMessageContent } from 'src/app/models/direct-message';
import { AuthService } from './auth.service';
import { User } from 'src/app/shared/services/user';


@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService) { }


  getChatParticipants(loggedInUserId: string, selectedUserId: string): Observable<[User | null, User | null]> {
    const selectedUser$ = this.authService.getUserData(selectedUserId);
    const loggedInUser$ = this.authService.getUserData(loggedInUserId);

    return combineLatest([selectedUser$, loggedInUser$]);
  }


  async createAndAddMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    const loggedInUser = this.authService.currentUserValue;

    const message = new DirectMessageContent({
      senderId: senderId,
      receiverId: receiverId,
      content: content,
      timestamp: Date.now(),
      read: false,
      senderImage: loggedInUser?.photoURL ?? ''
    });

    const messageCollection = this.getMessageCollection(senderId, receiverId);
    await addDoc(messageCollection, message.toJSON());
  }


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


  // async markMessageAsRead(userId1: string, userId2: string, messageId: string): Promise<void> {
  //   const messageCollection = this.getMessageCollection(userId1, userId2);
  //   const messageDoc = doc(this.firestore, `directMessage/${this.generateChatId(userId1, userId2)}/messages/${messageId}`);
  //   await updateDoc(messageDoc, { read: true });
  // }


  getUnreadMessagesCount(userId1: string, userId2: string): Observable<number> {
    return this.getDirectMessages(userId1, userId2).pipe(
      map(messages => messages.filter(message => !message.read && message.receiverId === userId1).length),
      catchError(error => {
        console.error("Error getting unread messages:", error);
        return of(0);
      })
    );
  }


  async markAllMessagesAsRead(userId1: string, userId2: string): Promise<void> {
    const messageCollection = this.getMessageCollection(userId1, userId2);
    const unreadQuery = query(messageCollection, where("read", "==", false), where("receiverId", "==", userId1));
    const querySnapshot = await getDocs(unreadQuery);
    const batch = writeBatch(this.firestore);

    querySnapshot.forEach(queryDoc => {
      const messageDoc = doc(this.firestore, `directMessage/${this.generateChatId(userId1, userId2)}/messages/${queryDoc.id}`);
      batch.update(messageDoc, { read: true });
    });
    await batch.commit();
  }


  removePTags(htmlContent: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;

    div.querySelectorAll('p').forEach(p => {
      const text = p.innerText;
      const textNode = document.createTextNode(text);
      p.replaceWith(textNode);
    });

    return div.innerHTML;
  }

}
