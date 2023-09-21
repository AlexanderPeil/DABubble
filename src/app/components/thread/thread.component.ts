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
import "quill-mention";
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
import { MessageContent } from 'src/app/models/message';
Quill.register('modules/emoji', Emoji);


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})


export class ThreadComponent implements OnInit, OnDestroy {
  isOnline?: boolean;
  messageContent: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  user_images = '../assets/img/avatar1.svg';
  quill: any;
  selectedMessage: MessageContent | null = null;
  selectedUser: User | null = null;
  loggedInUser: User | null = null;


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


  constructor(public storageService: StorageService, public dialog: MatDialog, public threadService: ThreadService, private authService: AuthService,
    public route: ActivatedRoute, private messageService: MessageService, public router: Router,) {

  }


  ngOnInit(): void {
    const urlSegments = this.router.url.split('/');
    let messageId: string;
    let channelId: string | null = null;    

    if (urlSegments.includes('channel')) {
      channelId = urlSegments[3];
      messageId = urlSegments[5];
      this.messageService.getChannelMessageById(channelId, messageId).subscribe(message => {
        this.selectedMessage = message;
        console.log(message);
        
      });
    } else if (urlSegments.includes('direct-message')) {
      messageId = urlSegments[5];
      this.selectedUser = this.messageService.selectedUser;
      this.loggedInUser = this.messageService.loggedInUser;
      console.log(this.selectedUser, this.loggedInUser);
      
      if (this.loggedInUser && this.selectedUser) {
        this.messageService.getDirectMessageById(this.loggedInUser.uid, this.selectedUser.uid, messageId).subscribe(message => {
          this.selectedMessage = message;
          console.log(message);
          
        });
      }
    }
  }


  setFocus(editor: any): void {
    this.quill = editor;
    editor.focus();
  }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      }
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


  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  ngOnDestroy(): void {

  }


}
