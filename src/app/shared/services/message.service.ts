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
  query,
  docData,
  updateDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, catchError, firstValueFrom, map, of, take } from 'rxjs';
import { MessageContent } from 'src/app/models/message';
import { AuthService } from './auth.service';
import { User } from 'src/app/shared/services/user';


@Injectable({
  providedIn: 'root'
})
export class MessageService {
  selectedUser: User | null = null;
  loggedInUser: User | null = null;
  currentChatPartners: { [userId: string]: string } = {};
  usersInChat: { [userId: string]: boolean } = {};
  currentChatPartnerSubject = new BehaviorSubject<string | null>(null);
  currentChatPartner$ = this.currentChatPartnerSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private authService: AuthService) { }


  // Here begins the logic for all messages
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
    const messageCollection = this.getDirectMessageCollection(userId1, userId2);
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

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('de-DE', options);
  }
  // Here ends the logic for all messages


  // Here begins the logic for the direct-messages
  async createAndAddMessage(senderId: string, receiverId: string, senderName: string, content: string): Promise<void> {
    const loggedInUser = this.authService.currentUserValue;
    let read = false; 
    const currentChatPartner = await firstValueFrom(this.currentChatPartner$.pipe(take(1)));
    if (currentChatPartner === receiverId) {
        read = true;
    }

    const message = new MessageContent({
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        timestamp: Date.now(),
        senderName: senderName,
        read: read, 
        senderImage: loggedInUser?.photoURL ?? '',
        hasThread: false
    });

    const messageCollection = this.getDirectMessageCollection(senderId, receiverId);
    try {
        await addDoc(messageCollection, message.toJSON());
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}


  getDirectMessageCollection(userId1: string, userId2: string) {
    const chatId = this.generateChatId(userId1, userId2);
    return collection(doc(this.firestore, `directMessage/${chatId}`), 'messages');
  }


  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }


  getDirectMessages(userId1: string, userId2: string): Observable<MessageContent[]> {
    const messageCollection = this.getDirectMessageCollection(userId1, userId2);
    return collectionData(messageCollection, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => new MessageContent(doc)))
    );
  }


  getDirectMessageById(userId1: string, userId2: string, messageId: string): Observable<MessageContent | null> {
    const messageCollection = this.getDirectMessageCollection(userId1, userId2);
    const messageRef = doc(messageCollection, messageId);

    return docData(messageRef, { idField: 'id' }).pipe(
      map(data => {
        if (data) {
          return new MessageContent({ ...data });
        } else {
          return null;
        }
      })
    );
  }


  async updateDirectMessage(userId1: string, userId2: string, messageId: string, updatedContent: string): Promise<void> {
    const messageCollection = this.getDirectMessageCollection(userId1, userId2);
    const messageRef = doc(messageCollection, messageId);

    try {
      await updateDoc(messageRef, {
        content: updatedContent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }


  setCurrentChatPartner(userId: string | null) {
    this.currentChatPartnerSubject.next(userId);
  }
  // Here ends the logic for the direct-messages


  // Here begins the logic for channel-messages
  async createAndAddChannelMessage(channelId: string, senderId: string, senderName: string, content: string) {
    const loggedInUser = this.authService.currentUserValue;
    const message = new MessageContent({
      senderId: senderId,
      content: content,
      timestamp: Date.now(),
      read: false,
      senderName: senderName,
      senderImage: loggedInUser?.photoURL ?? '',
      hasThread: false
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


  getChannelMessageById(channelID: string, messageId: string): Observable<MessageContent | null> {
    const messageRef = doc(this.getChannelMessageCollection(channelID), messageId);
    return docData(messageRef, { idField: 'id' }).pipe(
      map(data => {
        if (data) {
          return new MessageContent({ ...data });
        } else {
          return null;
        }
      })
    );
  }

  async updateChannelMessage(channelID: string, messageId: string, updatedContent: string) {
    const messageRef = doc(this.getChannelMessageCollection(channelID), messageId);

    try {
      await updateDoc(messageRef, {
        content: updatedContent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }
  // Here ends the logic for channel-messages


  // Here begins the logic for the thread-messages  
  async createAndAddThreadMessage(senderId: string, senderName: string, content: string, messageId: string): Promise<string | null> {
    const loggedInUser = this.authService.currentUserValue;
    const message = new MessageContent({
      senderId: senderId,
      content: content,
      timestamp: Date.now(),
      read: false,
      senderName: senderName,
      senderImage: loggedInUser?.photoURL ?? '',
      hasThread: true,
      messageId: messageId
    });
    const messageCollection = collection(this.firestore, 'thread-messages');
    try {
      const docRef = await addDoc(messageCollection, message.toJSON());
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      return null;
    }
  }


  getThreadMessagesForMessageId(messageId: string): Observable<MessageContent[]> {
    const threadMessageCollection = collection(this.firestore, 'thread-messages');
    const threadQuery = query(threadMessageCollection, where("messageId", "==", messageId));

    return collectionData(threadQuery, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => new MessageContent(doc)))
    );
  }


  updateHasThreadForChannelMessage(channelId: string, messageId: string, hasThread: boolean): Promise<void> {
    const messageDocRef = doc(this.firestore, 'channels', channelId, 'messages', messageId);
    return updateDoc(messageDocRef, { hasThread: hasThread });
  }


  async updateHasThreadForDirectMessage(userId1: string, userId2: string, messageId: string, hasThread: boolean): Promise<void> {
    const messageCollection = this.getDirectMessageCollection(userId1, userId2);
    const messageRef = doc(messageCollection, messageId);

    try {
      await updateDoc(messageRef, {
        hasThread: hasThread
      });
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }
  // Here ends the logic for the thread-messages  
}