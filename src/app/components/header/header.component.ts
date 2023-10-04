import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Channel } from 'src/app/models/channel';
import { MessageContent } from 'src/app/models/message';
import { MessageService } from 'src/app/shared/services/message.service';
import { ChannelService } from 'src/app/shared/services/channel.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userSubscription!: Subscription;
  showMenu = false;
  isOnline?: boolean;
  user_images = '../assets/img/avatar1.svg';
  searchTerm!: string;
  isDataLoaded: boolean = false;
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


  onSearchFocus(): void {
    if (!this.isDataLoaded) {
      this.loadData();
    }
  }


  loadData(): void {
    this.authService.getUsers().subscribe(users => {
      this.searchResults.users = users;
    });

    this.channelService.getChannels().subscribe(channels => {
      this.searchResults.channels = channels;
    });

    this.messageService.getAllDirectMessages().subscribe(directMessages => {
      this.searchResults.directMessages = directMessages;
    });

    this.isDataLoaded = true;
  }


  onSearchChange(term: string): void {
    if (this.searchResults.users) {
      this.searchResults.users = this.searchResults.users.filter(user => user.displayName?.includes(term));

    } 
    
    if (this.searchResults.channels) {
      this.searchResults.channels = this.searchResults.channels.filter(channel => channel.channelName.includes(term));
    }

    if (this.searchResults.directMessages) {
      this.searchResults.directMessages = this.searchResults.directMessages.filter(directMessage => directMessage.content.includes(term));
    }

  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

}
