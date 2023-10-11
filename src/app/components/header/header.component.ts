import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Channel } from 'src/app/models/channel';
import { MessageContent } from 'src/app/models/message';
import { MessageService } from 'src/app/shared/services/message.service';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { QuillService } from 'src/app/shared/services/quill.service';
import { Router } from '@angular/router';

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
  messagesSubscription?: Subscription;
  messages: MessageContent[] = [];
  filteredMessages: MessageContent[] = [];
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
    private channelService: ChannelService,
    private router: Router) { }



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
      this.filterMessages(term)
    ])
      .subscribe(([users, channels, channelMessages]) => {
        this.searchResults.users = users;
        this.searchResults.channels = channels;
        this.searchResults.channelMessages = channelMessages;
      });
  }


  filterMessages(term: string): Observable<MessageContent[]> {
    return new Observable(observer => {
      if (term) {
        const filtered = this.messages.filter(message => message.contentLowerCase.includes(term.toLowerCase()));
        observer.next(filtered);
        observer.complete();
      } else {
        observer.next([...this.messages]);
        observer.complete();
      }
    });
  }


  navigateToChannel(channelId: string): void {
    this.searchList = false;
    this.searchTerm = '';
    this.router.navigate(['/main/channel', channelId]);
  }


  navigateToDirectMessage(uid: string) {
    this.searchList = false;
    this.searchTerm = '';
    this.router.navigate(['/main/direct-message', uid])
  }


  loadAllMessages(): void {
    this.messagesSubscription?.unsubscribe();
    this.messageService.fetchAllChannelMessages().subscribe({
      next: messages => {
        this.messages = messages;
      },
      error: error => {
        console.error("Fehler beim Laden der Nachrichten:", error);
      }
    });
  }


  navigateToChannelMessage(channelId: string, messageId: string): void {
    this.searchList = false;
    this.searchTerm = '';
    this.messageService.setSelectedMessageId(messageId);
    this.messageService.shouldScrollToSpecificMessage = true;
    this.router.navigate(['/main/channel', channelId]);
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.messagesSubscription?.unsubscribe();
  }

}
