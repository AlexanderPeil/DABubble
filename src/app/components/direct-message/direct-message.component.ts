import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Observable, Subject, Subscription, combineLatest, filter, map, of, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/shared/services/message.service';
import { MessageContent } from 'src/app/models/message';
import { DialogDirectMessageProfileComponent } from '../dialog-direct-message-profile/dialog-direct-message-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { QuillService } from 'src/app/shared/services/quill.service';

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
  popUpToEditMessageIsOpen: boolean = false;
  showEditMessageButton: boolean = false;
  currentlyEditingMessageId: string | null = null;
  isEditing: string | null = null;
  updatedMessageContent: string = '';
  messagesSubscription: Subscription | null = null;
  selectedMessageId: string | null = null;
  showEditMenu: boolean = true;


  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    public messageService: MessageService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public threadService: ThreadService,
    public quillService: QuillService) { }


  ngOnInit() {
    this.loadChatParticipants().subscribe(([selectedUser, loggedInUser]) => {
      this.messageService.selectedUser = selectedUser;
      this.messageService.loggedInUser = loggedInUser;

      if (loggedInUser && selectedUser) {
        this.messageService.usersInChat[loggedInUser.uid] = true;
        this.loadDirectMessages(loggedInUser.uid, selectedUser.uid);
      } else {
        console.error("Either loggedInUser or selectedUser is null");
      }
    });
  }


  loadChatParticipants(): Observable<[User | null, User | null]> {
    return combineLatest([
      this.route.paramMap.pipe(map(params => params.get('id'))),
      this.authService.user$
    ]).pipe(
      filter(([uid, user]) => !!uid && !!user),
      switchMap(([uid, loggedInUser]) => {
        const selectedUser$ = this.authService.getUserData(uid as string);
        return combineLatest([selectedUser$, of(loggedInUser)]);
      }),
      takeUntil(this.ngUnsubscribe)
    );
  }


  loadDirectMessages(userId1: string, userId2: string) {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    this.messagesSubscription = this.messageService.getDirectMessages(userId1, userId2)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(messages => {
        messages.sort((a, b) => a.timestamp - b.timestamp);
        this.messages = messages;
        this.groupedMessages = this.messageService.groupMessagesByDate(this.messages);
        setTimeout(() => {
          this.scrollToBottom();
        }, 500);
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
        this.scrollToBottom();
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


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      },
    });
  }


  scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  onEmojiClick(messageId: string, emojiType: string): void {
    const loggedInUserId = this.messageService.loggedInUser?.uid as string;
    const receiverUserId = this.messageService.selectedUser?.uid as string;
    this.messageService.setEmoji(loggedInUserId, receiverUserId, messageId, emojiType);
  }


  openEmojiPopUp(messageId: string) {
    this.selectedMessageId = this.selectedMessageId === messageId ? null : messageId;
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
    if (this.selectedMessageId === messageId) {
      this.selectedMessageId = null;
    }

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
    this.showEditMenu = true;
  }


  editMessage(messageId: string, currentContent: string) {
    this.isEditing = messageId;
    this.updatedMessageContent = currentContent;
    this.showEditMenu = false;
  }


  retryLoadImage(user: User | null) {
    if (user) {
      user.photoURL = this.user_images;
    }
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.messageService.setCurrentChatPartner(null);
  }

}
