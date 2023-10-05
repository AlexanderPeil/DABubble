import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription, combineLatest, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Channel } from 'src/app/models/channel';
import { MessageContent } from 'src/app/models/message';
import { MessageService } from 'src/app/shared/services/message.service';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { QuillService } from 'src/app/shared/services/quill.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @HostListener('document:click', ['$event'])
  user: User | null = null;
  userSubscription!: Subscription;
  showMenu = false;
  isOnline?: boolean;
  user_images = '../assets/img/avatar1.svg';
  searchTerm: string = '';
  searchList?: boolean;
  searchSub?: Subscription;
  searchResults: {
    users?: User[],
    channels?: Channel[],
    directMessages?: MessageContent[],
    channelMessages?: MessageContent[],
  } = {};


  constructor(
    private authService: AuthService,
    private _eref: ElementRef,
    public dialog: MatDialog,
    public quillService: QuillService,
    private messageService: MessageService,
    private channelService: ChannelService) { }



  ngOnInit() {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.isOnline = user?.isOnline ?? undefined;
    });
  }


  retryLoadImage(user: User | null) {
    if (user) {
      user.photoURL = this.user_images;
    }
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container'
    });
  }


  @HostListener('document:click', ['$event'])
  clickout(event: { target: any; }) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
  }


  toggleMenu() {
    this.showMenu = !this.showMenu;
  }


  onLogout() {
    this.authService.signOut();
    this.showMenu = false;
  }


  onSearchChange(term: string): void {
    this.searchList = term.length > 0;
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.searchSub = combineLatest([      
      this.authService.getUsers(term),
      this.channelService.getChannels(term),
      this.messageService.getSearchedDirectMessages(term),
      this.messageService.getSearchedChannelMessages(term)
    ])
    .subscribe(([users, channels, directMessages, channelMessages]) => {
      this.searchResults.users = users;
      this.searchResults.channels = channels;
      this.searchResults.directMessages = directMessages;
      this.searchResults.channelMessages = channelMessages;
    });
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

}
