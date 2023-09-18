import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
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
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';
import { User } from 'src/app/shared/services/user';
import 'quill-mention';
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
import { Subject, takeUntil, tap } from 'rxjs';
import { MessageContent } from 'src/app/models/direct-message';
import { ThreadService } from 'src/app/shared/services/thread.service';
Quill.register('modules/emoji', Emoji);

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
  quill: any;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: MessageContent[] = [];
  groupedMessages: { date: string; messages: MessageContent[] }[] = [];
  messageContent: string = '';
  user_images = '../assets/img/avatar1.svg';
  loggedInUser: User | null = null;
  private ngUnsubscribe = new Subject<void>();

  public quillModules = {
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
    toolbar: [['mention'], ['clean']],
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
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
      },
    },
  };

  constructor(
    public dialog: MatDialog,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public activatedRoute: ActivatedRoute,
    public channelService: ChannelService,
    public storageService: StorageService,
    private authService: AuthService,
    private directMessageService: DirectMessageService,
    public threadService: ThreadService
  ) {}

  ngOnInit(): void {
    this.getCurrentChannelIdInUrl();
    const loggedInUserId = this.authService.currentUserValue?.uid;
    console.log(loggedInUserId);

    if (loggedInUserId) {
      this.directMessageService
        .getLoggedInUser(loggedInUserId)
        .pipe(
          tap((user) => console.log('Received user from service:', user)),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe((user) => {
          this.loggedInUser = user;

          this.directMessageService
            .getChannelMessages(this.channelId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((messages) => {
              messages.sort((a, b) => a.timestamp - b.timestamp);
              this.messages = messages;
              this.groupedMessages =
                this.directMessageService.groupMessagesByDate(this.messages);
            });
        });
    } else {
      console.error('No logged in user ID found.');
    }
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

  sendMessage() {
    console.log(this.messageContent, this.loggedInUser);

    if (this.messageContent && this.loggedInUser) {
      const cleanedContent = this.directMessageService.removePTags(
        this.messageContent
      );
      this.directMessageService
        .createAndAddChannelMessage(
          this.channelId,
          this.loggedInUser.uid,
          cleanedContent
        )
        .then(() => {
          this.messageContent = '';
        })
        .catch((error: any) => {
          console.error("Couldn't send a message:", error);
        });
    } else {
      console.error('Please try again.');
    }
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleTimeString('de-DE', options);
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
    const realEmojiButton = document.querySelector(
      '.textarea-emoji-control'
    ) as HTMLElement;
    if (realEmojiButton) {
      realEmojiButton.click();
    }
  }

  searchUsers(searchTerm: string, renderList: Function) {
    this.authService.getUsers(searchTerm).subscribe((users: User[]) => {
      const values = users.map((user) => ({
        id: user.uid,
        value: user.displayName,
        photoURL: user.photoURL,
        displayName: user.displayName,
      }));
      renderList(values, searchTerm);
    });
  }

  selectUser(user: User): void {
    this.messageContent = this.messageContent.replace(
      /@[^@]*$/,
      '@' + user.displayName + ' '
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop =
      this.messagesContainer.nativeElement.scrollHeight;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
