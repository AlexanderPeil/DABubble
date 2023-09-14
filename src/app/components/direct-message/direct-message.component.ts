import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Subject, filter, map, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';
import { DirectMessageContent } from 'src/app/models/direct-message';
import { DialogDirectMessageProfileComponent } from '../dialog-direct-message-profile/dialog-direct-message-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import "quill-mention";
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
Quill.register('modules/emoji', Emoji);



@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  isOnline?: boolean;
  selectedUser: User | null = null;
  loggedInUser: User | null = null;
  messageContent: string = '';
  messages: DirectMessageContent[] = [];
  groupedMessages: { date: string, messages: DirectMessageContent[] }[] = [];
  foundUsers: User[] = [];
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  user_images = '../assets/img/avatar1.svg';
  quill: any;


  public quillModules = {
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
    toolbar: [
      ['mention'],
      ['clean']
    ],
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@"],
      source: this.searchUsers.bind(this),
      renderItem(item: any) {

        const div = document.createElement('div');
        const img = document.createElement('img');
        const span = document.createElement('span');

        img.src = item.photoURL;
        img.classList.add('user-dropdown-image');
        span.textContent = item.displayName;

        div.appendChild(img);
        div.appendChild(span);

        return div;
      },
      onSelect: (item: any, insertItem: (arg0: any) => void) => {
        insertItem(item);
      }
    }
  };



  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private directMessageService: DirectMessageService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public threadService: ThreadService) { }


  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(uid => !!uid),
      switchMap(uid => {
        const loggedInUserId = this.authService.currentUserValue?.uid;
        return this.directMessageService.getChatParticipants(loggedInUserId as string, uid as string);
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(([selectedUser, loggedInUser]) => {
      this.selectedUser = selectedUser;
      this.loggedInUser = loggedInUser;

      if (loggedInUser && selectedUser) {
        this.directMessageService.getDirectMessages(loggedInUser.uid, selectedUser.uid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(messages => {
            messages.sort((a, b) => a.timestamp - b.timestamp);
            this.messages = messages;
            this.groupedMessages = this.groupMessagesByDate(this.messages);
          });
      } else {
        console.error("Either loggedInUser or selectedUser is null");
      }
    });
    this.filterUsers();
  }



  sendMessage() {
    if (this.messageContent && this.selectedUser && this.loggedInUser) {
      const cleanedContent = this.directMessageService.removePTags(this.messageContent);
      this.directMessageService.createAndAddMessage(
        this.loggedInUser.uid,
        this.selectedUser.uid,
        cleanedContent
      ).then(() => {
        this.messageContent = '';
      }).catch((error: any) => {
        console.error("Couldn't send a message:", error);
      });
    } else {
      console.error("Please try again.");
    }
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


  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('de-DE', options);
  }


  groupMessagesByDate(messages: DirectMessageContent[]): { date: string, messages: DirectMessageContent[] }[] {
    return messages.reduce<{ date: string, messages: DirectMessageContent[] }[]>((grouped, message) => {
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


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogDirectMessageProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container',
      data: { selectedUser: this.selectedUser }
    });
  }


  searchUsers(searchTerm: string, renderList: Function, mentionChar: string) {
    this.authService.getUsers(searchTerm).subscribe((users: User[]) => {
      const values = users.map(user => ({
        id: user.uid,
        value: user.displayName,
        denotationChar: mentionChar,
        photoURL: user.photoURL,
        displayName: user.displayName
      }));
      renderList(values, searchTerm);
    });
  }


  triggerAtSymbol() {
    this.quill.focus();
    setTimeout(() => {
      const currentPosition = this.quill.getSelection()?.index || 0;
      this.quill.insertText(currentPosition, '@ ');
      this.quill.setSelection(currentPosition + 1);
    }, 0);
  }


  toggleEmojiPicker() {
    const realEmojiButton = document.querySelector('.textarea-emoji-control') as HTMLElement;
    if (realEmojiButton) {
      realEmojiButton.click();
    }
  }



  filterUsers(query?: string): void {
    this.authService.getUsers(query).subscribe((users) => {
      this.foundUsers = users;
    });
  }


  selectUser(user: User): void {
    this.messageContent = this.messageContent.replace(/@[^@]*$/, '@' + user.displayName + ' ');
  }


  chooseFiletoUpload($event: any) {
    this.storageService.chooseFileSevice($event);
  }


  setFocus(editor: any): void {
    this.quill = editor;
    editor.focus();
  }



  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  openThread() {

  }

}
