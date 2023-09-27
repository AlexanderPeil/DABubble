import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogShowMembersInChannelComponent } from '../dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Channel } from 'src/app/models/channel';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { User } from 'src/app/shared/services/user';
import { Observable, Subject, combineLatest, filter, map, switchMap, takeUntil } from 'rxjs';
import { MessageContent } from 'src/app/models/message';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { QuillService } from 'src/app/shared/services/quill.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent implements OnInit, OnDestroy {
  isOnline?: boolean;
  channelId!: string;
  channel: Channel = new Channel();
  url: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: MessageContent[] = [];
  groupedMessages: { date: string; messages: MessageContent[] }[] = [];
  messageContent: string = '';
  user_images = '../assets/img/avatar1.svg';
  loggedInUser: User | null = null;
  displayCheckedIcon: boolean = false;
  displayHandsUpIcon: boolean = false;
  emojiPopUpIsOopen: boolean = false;
  popUpToEditMessageIsOpen: boolean = false;
  showEditMessageButton: boolean = false;
  currentlyEditingMessageId: string | null = null;
  isEditing: string | null = null;
  updatedMessageContent: string = '';
  private ngUnsubscribe = new Subject<void>();


  constructor(public dialog: MatDialog, public toggleWorspaceMenuService: ToggleWorkspaceMenuService, public activatedRoute: ActivatedRoute,
    public channelService: ChannelService, public storageService: StorageService, public authService: AuthService, public messageService: MessageService,
    public threadService: ThreadService, private elementRef: ElementRef, public quillService: QuillService) {
  }


  ngOnInit(): void {
    this.getCurrentChannelIdInUrl();
    this.fetchAndDisplayMessages();
  }


  processMessages(messages: MessageContent[]): void {
    messages.sort((a, b) => a.timestamp - b.timestamp);
    this.messages = messages;
    this.groupedMessages = this.messageService.groupMessagesByDate(this.messages);
  }


  getCurrentChannelIdInUrl() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.channelId = String(params.get('id'));
      this.channelService.getSingleChannelService(this.channelId);
    });
  }


  openDialogToEditChannel() {
    this.dialog.open(DialogEditChannelComponent, {
      data: {
        channelId: this.channelId,
        channelName: this.channelService.channel.channelName,
        channelDescription: this.channelService.channel.channelDescription,
      },
    });
  }


  openDialogToShowMembersInChannel() {
    this.dialog.open(DialogShowMembersInChannelComponent, {
      data: {
        channelId: this.channelId,
      },
    });
    this.getCurrentChannelIdInUrl();
  }


  openDialogToAddMembersToChannel() {
    this.dialog.open(DialogAddMembersInChannelComponent, {
      data: {
        channelId: this.channelId,
      },
    });
    this.getCurrentChannelIdInUrl();
  }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      },
    });
  }


  sendMessage() {
    if (this.messageContent && this.loggedInUser) {
      const senderName = this.loggedInUser.displayName as string;
      const cleanedContent = this.messageService.removePTags(
        this.messageContent
      );
      this.messageService
        .createAndAddChannelMessage(
          this.channelId,
          this.loggedInUser.uid,
          senderName,
          cleanedContent
        )
        .then(() => {
          this.messageContent = '';
          this.scrollToBottom();
        })
        .catch((error: any) => {
          console.error("Couldn't send a message:", error);
        })
    } else {
      console.error('Please try again.');
    }
  }


  toggleEmojiPicker() {
    const realEmojiButton = document.querySelector(
      '.textarea-emoji-control'
    ) as HTMLElement;
    if (realEmojiButton) {
      realEmojiButton.click();
    }
  }


  selectUser(user: User): void {
    this.messageContent = this.messageContent.replace(
      /@[^@]*$/,
      '@' + user.displayName + ' '
    );
  }


  scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop =
      this.messagesContainer.nativeElement.scrollHeight;
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
    if (this.loggedInUser?.uid === message.senderId && message.id) {
      this.currentlyEditingMessageId = this.currentlyEditingMessageId === message.id ? null : message.id;
    }
  }


  @HostListener('document:click', ['$event'])
  onCloseEmojiPopUp($event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.emojiPopUpIsOopen = false;
    }
  }


  @HostListener('document:click', ['$event'])
  onCloseEditMessagePopUp($event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.popUpToEditMessageIsOpen = false;
    }
  }


  onMessageHover(message: MessageContent) {
    this.showEditMessageButton = this.loggedInUser?.uid === message.senderId;
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


  fetchAndDisplayMessages(): void {
    this.getParamsAndUser().pipe(
      switchMap(([channelId, user]) => {
        this.loggedInUser = user;
        return this.messageService.getChannelMessages(channelId);
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(messages => this.processMessages(messages));
  }


  getParamsAndUser(): Observable<[string, User | null]> {
    return combineLatest([
      this.activatedRoute.params,
      this.authService.user$
    ]).pipe(
      map(([params, user]) => [params['id'], user] as [string, User | null]),
      filter(([channelId, user]) => !!channelId && !!user)
    );
  }


  saveEditedMessage(message: MessageContent) {
    const messageId = message.id;
    const channelId = this.channelId;
    const updatedMessageContent = this.updatedMessageContent;

    if (messageId && channelId && this.updatedMessageContent && this.updatedMessageContent !== message.content) {
      this.messageService.updateChannelMessage(channelId, messageId, updatedMessageContent);
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
