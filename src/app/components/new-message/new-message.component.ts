import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MessageService } from 'src/app/shared/services/message.service';
// import { startWith, map, Observable, of, BehaviorSubject, filter } from 'rxjs';
// import { User } from 'src/app/shared/services/user';
// import { Channel } from 'src/app/models/channel';
// import { DocumentData } from '@angular/fire/firestore';
// import { FormControl } from '@angular/forms';
import { QuillService } from 'src/app/shared/services/quill.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
})
export class NewMessageComponent implements OnInit, OnDestroy {
  dropDownMenuUserIsOpen: boolean = false;
  users: { user: any; unreadCount?: number }[] = [];
  isOnline?: boolean;
  foundUsers: any[] = [];
  messageContent: string = '';
  selectedChannelId: string | null = null;
  selectedUserId: string | null = null;
  selectedChannelIdSubscription!: Subscription;
  selectedUserIdSubscription!: Subscription;
  newMessageQuillInstance: any;
  uploadedFiles: { url: string; type: 'image' | 'data'; }[] = [];
  messageContainerError: boolean = false;
  @ViewChild('newMessagQuill', { static: false, read: ElementRef }) newMessagQuill!: ElementRef;
  @ViewChild('newMessageDropdownAbove', { static: false, read: ElementRef }) newMessageDropdownAbove!: ElementRef;


  constructor(
    public dialog: MatDialog,
    public storageService: StorageService,
    public channelService: ChannelService,
    public elementRef: ElementRef,
    private authService: AuthService,
    private messageService: MessageService,
    public quillService: QuillService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setSelectedChannelId();
    this.setSelectedUserId();
    // this.authService.getUsers().subscribe((usersData) => {
    //   this.users = usersData.map((user) => ({ user, unreadCount: 0 }));
    //   this.users.forEach((userWithCount, index) => {
    //     const loggedInUid = this.authService.currentUserValue?.uid;
    //     if (userWithCount.user && loggedInUid) {
    //       this.messageService
    //         .getUnreadMessagesCount(loggedInUid, userWithCount.user.uid)
    //         .subscribe((unreadCount) => {
    //           if (this.users[index]) {
    //             this.users[index].unreadCount = unreadCount;
    //           }
    //         });
    //     }
    //   });
    // });
  }

  // getInputValue($event: any) {
  //   this.channelService.channelData = of(this.channels); // Start with all items
  //   // RxJS operators for filtering based on search query
  //   this.channelService.channelData = this.channelService.channelData.pipe(
  //     startWith($event.target.value),
  //    filter(($event.target.value),  => {})
  //   );
  // }

  // filterItems(value: string): Observable<string[]> {
  //   return of(this.channels.filter(channel =>
  //     channel.toLowerCase().startsWith(value.toLowerCase()) ? this.dropDownMenuChannelsIsOpen : !this.dropDownMenuChannelsIsOpen
  //   ));
  // }

  // setFocus($event: any) {
  //   $event.focus();
  // }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      },
    });
  }

  // filterUsers(query?: string): void {
  //   this.authService.getUsers(query).subscribe((users) => {
  //     this.foundUsers = users;
  //   });
  // }

  // @HostListener('document: click', ['$event.target'])
  // closeDropdownIfClickingOutside($event: MouseEvent) {
  //   if (!this.elementRef.nativeElement.contains($event.target)) {
  //     this.dropDownMenuChannelsIsOpen = false;
  //   }
  //   if (!this.elementRef.nativeElement.contains($event.target)) {
  //     this.dropDownMenuUserIsOpen = false;
  //   }
  // }


  onEditorFocus(editorType: 'top' | 'bottom') {
    if (editorType === 'top') {
      this.newMessageDropdownAbove.nativeElement.classList.add('new-message-top');
      this.newMessagQuill.nativeElement.classList.remove('new-message-bottom');

      if (window.innerHeight <= 500) {
        this.newMessageDropdownAbove.nativeElement.classList.add('new-message-top-max-height');
      }

    } else if (editorType === 'bottom' && window.innerHeight <= 500) {
      this.newMessagQuill.nativeElement.classList.add('new-message-bottom');
      this.newMessageDropdownAbove.nativeElement.classList.remove('new-message-top');
    }
  }


  setSelectedChannelId() {
    this.selectedChannelIdSubscription = this.quillService.selectedChannelIdSubject.subscribe(channelId => {
      console.log('this channelid is:', channelId);

      if (channelId) {
        this.selectedChannelId = channelId;
        this.selectedUserId = null;
      }
    });
  }


  setSelectedUserId() {
    this.selectedUserIdSubscription = this.quillService.selectedUserIdSubject.subscribe(userId => {
      console.log('The userId is:', userId);
      if (userId) {
        this.selectedUserId = userId;
        this.selectedChannelId = null;
      }
    })
  }


  async sendMessage() {    
    const loggedInUser = this.authService.currentUserValue;
    const selectedItem = this.quillService.selectedItem;
  
    if (!selectedItem) {
      this.messageContainerError = true;
      setTimeout(() => {
        this.messageContainerError = false;
      }, 3000);
      return;
    }
  
    if (!this.messageContent && this.uploadedFiles.length === 0) {
      alert('Please enter a message or attach a file.');
      return;
    }
  
    try {
      const messageContent = this.messageService.removePTags(this.messageContent);
  
      if (selectedItem.denotationChar === '#') {
        await this.messageService.createAndAddChannelMessage(
          selectedItem.id,
          loggedInUser!.uid,
          loggedInUser!.displayName as string,
          messageContent,
          this.uploadedFiles
        );
        this.router.navigate(['/main/channel', selectedItem.id]);
      } else if (selectedItem.denotationChar === '@' || selectedItem.denotationChar === '*') {
        await this.messageService.createAndAddMessage(
          loggedInUser!.uid,
          selectedItem.id,
          loggedInUser!.displayName as string,
          messageContent,
          this.uploadedFiles
        );
        this.router.navigate(['/main/direct-message', selectedItem.id]);
      }
  
      this.messageContent = '';
      this.uploadedFiles = [];
      this.storageService.clearUploadedFiles();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  
  
  setFocus(event: any) {
    this.newMessageQuillInstance = event;
    this.quillService.setFocus(event)
  }


  toggleEmojiPicker() {
    const realEmojiButton = document.querySelector(
      '.textarea-emoji-control'
    ) as HTMLElement;
    if (realEmojiButton) {
      realEmojiButton.click();
    }
  }

  checkUploadedFiles() {
    console.log(this.uploadedFiles);    
  }


  ngOnDestroy() {
    this.selectedChannelIdSubscription?.unsubscribe();
    this.selectedUserIdSubscription?.unsubscribe();
    this.quillService.cleanup();
  }

}
