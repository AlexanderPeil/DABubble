import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';


@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})


export class NewMessageComponent implements OnInit {
  inputValue: string = '';
  dropDownMenuChannelsIsOpen: boolean = false;
  dropDownMenuUserIsOpen: boolean = false;
  users: { user: any, unreadCount?: number }[] = [];
  isOnline?: boolean;
  foundUsers: any[] = [];


  constructor(public dialog: MatDialog,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public storageService: StorageService,
    public channelService: ChannelService,
    public elementRef: ElementRef,
    private authService: AuthService,
    private directMessageService: DirectMessageService) {
  }


  ngOnInit(): void {
    this.authService.getUsers().subscribe((usersData) => {
      this.users = usersData.map(user => ({ user, unreadCount: 0 }));
      this.users.forEach((userWithCount, index) => {
        const loggedInUid = this.authService.currentUserValue?.uid;
        if (userWithCount.user && loggedInUid) {
          this.directMessageService.getUnreadMessagesCount(loggedInUid, userWithCount.user.uid)
            .subscribe(unreadCount => {
              if (this.users[index]) {
                this.users[index].unreadCount = unreadCount;
              }
            });
        }
      });
    });
  }


  setFocus($event: any) {
    $event.focus();
  }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      }
    });
  }


  filterUsers(query?: string): void {
    this.authService.getUsers(query).subscribe((users) => {
      this.foundUsers = users;
    });
  }


  @HostListener('document: click', ['$event.target'])
  closeDropdownIfClickingOutside($event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.dropDownMenuChannelsIsOpen = false;
    }
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.dropDownMenuUserIsOpen = false;
    }
  }


  getInputValue() {

  }
}
