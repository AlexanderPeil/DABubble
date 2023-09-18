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
import { Observable, ObservedValueOf, catchError, combineLatest, map, of } from 'rxjs';
import { MessageContent } from 'src/app/models/direct-message';
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

    const message = new MessageContent({
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


  getMessageCollection(userId1: string, userId2: string) {
    const chatId = this.generateChatId(userId1, userId2);
    return collection(doc(this.firestore, `directMessage/${chatId}`), 'messages');
  }


  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }


  getDirectMessages(userId1: string, userId2: string): Observable<MessageContent[]> {
    const messageCollection = this.getMessageCollection(userId1, userId2);
    return collectionData(messageCollection, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => new MessageContent(doc)))
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


  getLoggedInUser(loggedInUserId: string): Observable<User | null> {
    return this.authService.getUserData(loggedInUserId);
  }


  async createAndAddChannelMessage(channelId: string, senderId: string, content: string) {
    const loggedInUser = this.authService.currentUserValue;
    console.log(channelId, senderId, content), loggedInUser;

    const message = new MessageContent({
      senderId: senderId,
      content: content,
      timestamp: Date.now(),
      read: false,
      senderImage: loggedInUser?.photoURL ?? ''
    });
    const messageCollection = collection(this.firestore, 'channels', channelId, 'messages');
    try {
      await addDoc(messageCollection, message.toJSON());
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  getChannelMessageCollection(channelID: string) {
    return collection(this.firestore, 'channels', channelID, 'messages');
  }


  getChannelMessages(channelID: string): Observable<MessageContent[]> {
    const messageCollection = this.getChannelMessageCollection(channelID);
    return collectionData(messageCollection, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => new MessageContent(doc)))
    );
  }


  groupMessagesByDate(messages: MessageContent[]): { date: string, messages: MessageContent[] }[] {
    return messages.reduce<{ date: string, messages: MessageContent[] }[]>((grouped, message) => {
      const dateStr = this.formatDate(message.timestamp);
      const foundGroup = grouped.find(group => group.date === dateStr);
      if (foundGroup) {
        foundGroup.messages.push(message);
      } else {
        grouped.push({ date: dateStr, messages: [message] });
      }
      return grouped;
    }, []);
  }


  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(today.getDate() - 1);
    // Set the time to null to have a better compare for the date
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    }
  }

}
