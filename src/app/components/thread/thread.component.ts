import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/shared/services/message.service';
import { MessageContent } from 'src/app/models/message';
import { QuillService } from 'src/app/shared/services/quill.service';
import { Observable, Subject, combineLatest, of, takeUntil } from 'rxjs';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})


export class ThreadComponent implements OnInit, OnDestroy {
  isOnline?: boolean;
  messageContent: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private unsubscribe: Subject<void> = new Subject<void>();
  user_images = '../assets/img/avatar1.svg';
  selectedMessage: MessageContent | null = null;
  threadMessages: MessageContent[] = [];
  selectedUser: User | null = null;
  loggedInUser: User | null = null;
  channelId: string | null = null;


  constructor(public storageService: StorageService,
    public dialog: MatDialog,
    public threadService: ThreadService,
    private authService: AuthService,
    public route: ActivatedRoute,
    public messageService: MessageService,
    public router: Router,
    public quillService: QuillService) {

  }


  ngOnInit(): void {
    combineLatest([
      this.loadLoggedInUser(),
      of(this.router.url)
    ])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(([loggedInUser, currentUrl]) => {
        this.loggedInUser = loggedInUser;
        const urlSegments = currentUrl.split('/');
        let messageId: string = urlSegments[5];

        if (urlSegments.includes('channel')) {
          this.handleChannel(urlSegments, messageId);
        } else if (urlSegments.includes('direct-message') && this.loggedInUser) {
          this.handleDirectMessage(messageId);
        }
      });
  }


  handleChannel(urlSegments: string[], messageId: string): void {
    this.channelId = urlSegments[3];
    this.messageService.getChannelMessageById(this.channelId, messageId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(message => {
        this.selectedMessage = message;
        this.fetchThreadMessages(messageId);
      });
  }


  handleDirectMessage(messageId: string): void {
    this.selectedUser = this.messageService.selectedUser;

    if (this.loggedInUser && this.selectedUser) {
      this.messageService.getDirectMessageById(this.loggedInUser.uid, this.selectedUser.uid, messageId)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(message => {
          this.selectedMessage = message;
          this.fetchThreadMessages(messageId);
        });
    }
  }


  loadLoggedInUser(): Observable<User | null> {
    return this.authService.user$.pipe(takeUntil(this.unsubscribe));
  }


  fetchThreadMessages(messageId: string): void {
    if (this.selectedMessage?.hasThread) {
      this.messageService.getThreadMessagesForMessageId(messageId)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((threadMessages: MessageContent[]) => {
          this.threadMessages = threadMessages;
        });
    }
  }


  sendMessage() {
    const urlSegments = this.router.url.split('/');

    if (this.messageContent && this.loggedInUser) {
      const senderName = this.loggedInUser.displayName as string;
      const messageId = this.selectedMessage?.id;
      const cleanedContent = this.messageService.removePTags(this.messageContent);

      if (messageId) {
        this.messageService
          .createAndAddThreadMessage(
            this.loggedInUser.uid,
            senderName,
            cleanedContent,
            messageId
          )
          .then(() => {
            if (urlSegments.includes('channel')) {
              return this.messageService.updateHasThreadForChannelMessage(this.channelId!, messageId, true);
            } else if (urlSegments.includes('direct-message') && this.selectedUser) {
              return this.messageService.updateHasThreadForDirectMessage(this.loggedInUser!.uid, this.selectedUser.uid, messageId, true);
            }
            return Promise.resolve();
          })
          .then(() => {
            this.messageContent = '';
            this.scrollToBottom();
          })
          .catch((error: any) => {
            console.error("Couldn't send a message:", error);
          });
      } else {
        console.error('Please try again.');
      }
    } else {
      console.error('Either message content or loggedInUser was not found.');
    }
  }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      }
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


  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}