import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MessageService } from 'src/app/shared/services/message.service';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
  filter,
} from 'rxjs';
import { User } from 'src/app/shared/services/user';
import { Channel } from 'src/app/models/channel';

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
  inputValue: string = '';
  messageContent: string = '';
  quill: any;

  constructor(
    public dialog: MatDialog,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public storageService: StorageService,
    public channelService: ChannelService,
    public elementRef: ElementRef,
    private authService: AuthService,
    private messageService: MessageService
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

  public quillModules = {
    toolbar: false,
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@', '#'],
      source: this.searchMentions.bind(this),
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

  searchMentions(mentionText: string, renderList: Function) {
    // Überprüfen Sie, ob der Text mit "@" oder "#" beginnt, um Benutzer oder Channels zu suchen.
    if (mentionText.startsWith('@')) {
      const userSearchTerm = mentionText.substr(1); // Entfernen Sie das "@"-Zeichen
      this.searchUsers(userSearchTerm, renderList);
    } else if (mentionText.startsWith('#')) {
      const channelSearchTerm = mentionText.substr(1); // Entfernen Sie das "#" -Zeichen
      this.searchChannels(channelSearchTerm, renderList);
    } else {
      // Wenn weder "@" noch "#" vorhanden ist, geben Sie ein leeres Array zurück.
      renderList([]);
    }
  }

  searchUsers(searchTerm: string, renderList: Function) {
    console.log('searchUsers called with searchTerm:', searchTerm);

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

  searchChannels(searchTerm: string, renderList: Function) {
    console.log('searchChannels called with searchTerm:', searchTerm);

    this.channelService
      .getChannels(searchTerm)
      .subscribe((channels: Channel[]) => {
        const values = channels.map((channel) => ({
          id: channel.channelName, // Stellen Sie sicher, dass Ihre Channels eine eindeutige ID haben
          value: channel.channelName,
          displayName: channel.channelName,
        }));
        renderList(values, searchTerm);
      });
  }

  setFocus(editor: any): void {
    this.quill = editor;
    editor.focus();
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
