import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
})
export class NewMessageComponent implements OnInit {
  dropDownMenuChannelsIsOpen: boolean = false;
  dropDownMenuUserIsOpen: boolean = false;
  users: { user: any; unreadCount?: number }[] = [];
  isOnline?: boolean;
  foundUsers: any[] = [];
  messageContent: string = '';
  quill: any;

  constructor(
    public dialog: MatDialog,
    public storageService: StorageService,
    public channelService: ChannelService,
    public elementRef: ElementRef,
    private authService: AuthService,
    private messageService: MessageService,
    public quillService: QuillService
  ) {}

  ngOnInit(): void {
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
}
