import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Subject, Subscription, combineLatest, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';
import { DirectMessageContent } from 'src/app/models/direct-message';
import { DialogDirectMessageProfileComponent } from '../dialog-direct-message-profile/dialog-direct-message-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ThreadService } from 'src/app/shared/services/thread.service';


@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  userSubscription!: Subscription;
  isOnline?: boolean;
  selectedUser: User | null = null;
  loggedInUser: User | null = null;
  messageContent: string = '';
  messages: DirectMessageContent[] = [];
  showUserDropdown: boolean = false;
  foundUsers: User[] = [];
  private ngUnsubscribe = new Subject<void>();
  showEmojiPicker = false;
  @ViewChild('emojiContainer') emojiContainer!: ElementRef;
  @ViewChild('userMenu') userMenu!: ElementRef;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  user_images = '../assets/img/avatar1.svg';
  senderImage: string = '';
  receiverImage: string = '';


  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private directMessageService: DirectMessageService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    public threadService: ThreadService) { }


  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(uid => !!uid),
      switchMap(uid => {
        const loggedInUserId = this.authService.currentUserValue?.uid;
        return this.directMessageService.getChatParticipants(loggedInUserId as string, uid as string);
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(([selectedUser, loggedInUser]) => {
      this.selectedUser = selectedUser;
      this.loggedInUser = loggedInUser;

      if (loggedInUser && selectedUser) {
        this.directMessageService.getDirectMessages(loggedInUser.uid, selectedUser.uid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(messages => {
            messages.sort((a, b) => a.timestamp - b.timestamp);
            this.messages = messages;
          });
      } else {
        console.error("Either loggedInUser or selectedUser is null");
      }
    });
    this.filterUsers();
  }



  sendMessage() {
    if (this.messageContent && this.selectedUser && this.loggedInUser) {
      const cleanedContent = this.directMessageService.removePTags(this.messageContent);
      this.directMessageService.createAndAddMessage(
        this.loggedInUser.uid,
        this.selectedUser.uid,
        cleanedContent
      ).then(() => {
        this.messageContent = '';
      }).catch((error: any) => {
        console.error("Fehler beim Senden der Nachricht:", error);
      });
    } else {
      console.error("Bitte versuchen Sie es erneut.");
    }
  }


  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(today.getDate() - 1);
    // Set the time to null to have a better compare for the date
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    }
  }


  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('de-DE', options);
  }


  groupMessagesByDate(messages: DirectMessageContent[]): { date: string, messages: DirectMessageContent[] }[] {
    return messages.reduce<{ date: string, messages: DirectMessageContent[] }[]>((grouped, message) => {
      const dateStr = this.formatDate(message.timestamp);
      const foundGroup = grouped.find(group => group.date === dateStr);
      if (foundGroup) {
        foundGroup.messages.push(message);
      } else {
        grouped.push({ date: dateStr, messages: [message] });
      }
      return grouped;
    }, []);
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogDirectMessageProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container',
      data: { selectedUser: this.selectedUser }
    });
  }


  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }


  addEmoji(event: { emoji: any; }) {
    const { emoji } = event;
    this.messageContent += emoji.native;
    this.showEmojiPicker = false;
  }


  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const clickedInsideEmojiPicker = this.emojiContainer && this.emojiContainer.nativeElement.contains(event.target);
    const clickedInsideUserMenu = this.userMenu && this.userMenu.nativeElement.contains(event.target);

    if (this.showEmojiPicker && !clickedInsideEmojiPicker) {
      this.showEmojiPicker = false;
    }

    if (this.showUserDropdown && !clickedInsideUserMenu) {
      this.showUserDropdown = false;
    }
  }


  onTextChange(event: any) {
    const value = event.text;

    if (value.includes('@')) {
      const query = value.slice(value.lastIndexOf('@') + 1);
      this.showUserDropdown = true;
      this.filterUsers(query);
    } else {
      this.showUserDropdown = false;
      this.filterUsers();
    }
  }



  // checkForAtSymbol(event: any): void {
  //   const value = event.target.value;
  //   if (value.includes('@')) {
  //     const query = value.slice(value.lastIndexOf('@') + 1);
  //     this.showUserDropdown = true;
  //     this.filterUsers(query);
  //   } else {
  //     this.showUserDropdown = false;
  //     this.filterUsers();
  //   }
  // }


  triggerAtSymbol(event: MouseEvent): void {
    debugger
    console.log('Found this users:', this.foundUsers);
    event.stopPropagation();
    this.messageContent += '@';
    this.showUserDropdown = true;
    this.filterUsers();
    console.log('Found this users:', this.foundUsers);
  }


  filterUsers(query?: string): void {
    this.authService.getUsers(query).subscribe((users) => {
      this.foundUsers = users;
    });
  }


  selectUser(user: User): void {
    this.messageContent = this.messageContent.replace(/@[^@]*$/, '@' + user.displayName + ' ');
    this.showUserDropdown = false;
  }


  chooseFiletoUpload($event: any) {
    this.storageService.chooseFileSevice($event);
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  setFocus($event: any) {
    $event.focus();
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  private scrollToBottom(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }


  openThread() {

  }

}
