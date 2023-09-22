import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Subject, filter, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/shared/services/message.service';
import { MessageContent } from 'src/app/models/message';
import { DialogDirectMessageProfileComponent } from '../dialog-direct-message-profile/dialog-direct-message-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import "quill-mention";
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
Quill.register('modules/emoji', Emoji);


@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  isOnline?: boolean;
  messageContent: string = '';
  messages: MessageContent[] = [];
  groupedMessages: { date: string, messages: MessageContent[] }[] = [];
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  user_images = '../assets/img/avatar1.svg';
  quill: any;
  displayCheckedIcon: boolean = false;
  displayHandsUpIcon: boolean = false;
  emojiPopUpIsOopen: boolean = false;
  popUpToEditMessageIsOpen: boolean = false;
  showEditMessageButton: boolean = false;
  currentlyEditingMessageId: string | null = null;
  isEditing: string | null = null;
  updatedMessageContent: string = '';


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
    public messageService: MessageService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public threadService: ThreadService) { }


  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(uid => !!uid),
      switchMap(uid => this.messageService.loadChatParticipantsForUID(uid as string)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(([selectedUser, loggedInUser]) => {
      this.messageService.selectedUser = selectedUser;
      this.messageService.loggedInUser = loggedInUser;
      if (loggedInUser && selectedUser) {
        this.messageService.getDirectMessages(loggedInUser.uid, selectedUser.uid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(messages => {
            messages.sort((a, b) => a.timestamp - b.timestamp);
            this.messages = messages;
            this.groupedMessages = this.messageService.groupMessagesByDate(this.messages);
          });
      } else {
        console.error("Either loggedInUser or selectedUser is null");
      }
    });
  }


  sendMessage() {
    if (this.messageContent && this.messageService.selectedUser && this.messageService.loggedInUser) {
      const senderName = this.messageService.loggedInUser.displayName as string;
      const cleanedContent = this.messageService.removePTags(this.messageContent);
      this.messageService.createAndAddMessage(
        this.messageService.loggedInUser.uid,
        this.messageService.selectedUser.uid,
        senderName,
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


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogDirectMessageProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container',
      data: { selectedUser: this.messageService.selectedUser }
    });
  }


  searchUsers(searchTerm: string, renderList: Function) {
    this.authService.getUsers(searchTerm).subscribe((users: User[]) => {
      const values = users.map(user => ({
        id: user.uid,
        value: user.displayName,
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


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      },
    });
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  setCheckedIcon() {
    this.displayCheckedIcon = !this.displayCheckedIcon
  }


  setHandsUpIcon() {
    this.displayHandsUpIcon = !this.displayHandsUpIcon;
  }


  openEmojiPopUp() {
    this.emojiPopUpIsOopen = !this.emojiPopUpIsOopen;
  }


  openPopUpEditMessage(message: MessageContent) {
    if (this.messageService.loggedInUser?.uid === message.senderId && message.id) {
      this.currentlyEditingMessageId = this.currentlyEditingMessageId === message.id ? null : message.id;
    }
  }


  onMessageHover(message: MessageContent) {
    this.showEditMessageButton = this.messageService.loggedInUser?.uid === message.senderId;
  }


  closeEditMenu() {
    this.currentlyEditingMessageId = null;
  }


  handleMouseLeave(messageId: string): void {
    if (this.isEditing) {
      return;
    } else if (!this.isMessageBeingEdited(messageId)) {
      this.showEditMessageButton = false;
      this.closeEditMenu();
    }
  }


  isMessageBeingEdited(messageId: string): boolean {
    return this.isEditing === messageId;
  }


  stopEvent(event: Event) {
    event.stopPropagation();
  }


  saveEditedMessage(message: MessageContent) {
    const messageId = message.id;
    const updatedMessageContent = this.updatedMessageContent;
    const loggedInUserId = this.messageService.loggedInUser?.uid as string;
    const receiverUserId = this.messageService.selectedUser?.uid as string;    


    if (messageId && this.updatedMessageContent && this.updatedMessageContent !== message.content) {
      this.messageService.updateDirectMessage(loggedInUserId, receiverUserId, messageId, updatedMessageContent);
    }
    this.isEditing = null;
  }



  editMessage(messageId: string, currentContent: string) {
    this.isEditing = messageId;
    this.updatedMessageContent = currentContent;
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
