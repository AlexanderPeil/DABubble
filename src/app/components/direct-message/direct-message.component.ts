import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Observable, Subject, Subscription, combineLatest, filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';
import { DirectMessageContent } from 'src/app/models/direct-message';
import { DialogDirectMessageProfileComponent } from '../dialog-direct-message-profile/dialog-direct-message-profile.component';
import { MatDialog } from '@angular/material/dialog';


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
  showEmojiPicker = false;
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('emojiContainer') emojiContainer!: ElementRef;


  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private directMessageService: DirectMessageService,
    public dialog: MatDialog) { }


  ngOnInit() {
    // Observable to get the id of the selected user (selected in the sidenav).  
    const selectedUser$ = this.route.paramMap.pipe(
      map(params => params.get('id')), // "map": extracts the id from the route parameters.
      filter(uid => !!uid), // "filter": ensures that only true (non-falsy) uid values are passed through.
      switchMap(uid => this.authService.getUserData(uid as string)) // "switchMap": each UID that passes through the filter the authservice is invoked to fetch user data
    );

    // Observable to get the id of the logged-in user who selects an user from the sidenav to chat with
    const loggedInUser$ = this.authService.user$.pipe(
      tap(firebaseUser => { // "tap": checks if firebaseUser has a uid and set this.loggedInUser to null if it doesn't
        if (!firebaseUser?.uid) {
          this.loggedInUser = null;
        }
      }),
      switchMap(firebaseUser => firebaseUser?.uid ? this.authService.getUserData(firebaseUser.uid) : []), // "switchMap": each UID that passes through the filter the authservice is invoked to fetch user data
      filter(user => !!user) // This ensures that only true (non-falsy) uid values are passed through.
    );
    // Combines the two observables (logged-in user and selected user)
    combineLatest([selectedUser$, loggedInUser$])
      .pipe(takeUntil(this.ngUnsubscribe)) // "takeUntil": makes sure the observable completes when another obserable (ngUnsubscribe) emits a value. ngUnsubscribe is for the onDestroy
      .subscribe(([selectedUser, loggedInUser]) => {
        this.selectedUser = selectedUser;
        this.loggedInUser = loggedInUser;
        // If both users have valid values then fetches the direct messages with "this.directMessageService.getDirectMessages"
        if (loggedInUser && selectedUser) {
          this.directMessageService.getDirectMessages(loggedInUser.uid, selectedUser.uid)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((messages: any[]) => {
              this.messages = messages
                .map(msg => new DirectMessageContent(msg)) // This ensures that all the messages in this.messages are instances of DirectMessageContent
                .sort((a, b) => b.timestamp - a.timestamp); // Sorts the messages by date
            });
        } else {
          console.error("Either loggedInUser or selectedUser is null");
        }
      });
      this.filterUsers();
  }


  sendMessage() {
    if (this.messageContent && this.selectedUser && this.loggedInUser) {
      const chatMessage = new DirectMessageContent({
        senderId: this.loggedInUser.uid,
        content: this.messageContent,
        timestamp: Date.now(),
        read: false
      });

      this.directMessageService.addMessage(this.loggedInUser.uid, this.selectedUser.uid, chatMessage);
      this.messageContent = '';
    } else {
      console.error("Ein erforderliches Feld fehlt!");
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
    console.log(this.showEmojiPicker);
  }


  addEmoji(event: { emoji: any; }) {
    const { emoji } = event;
    this.messageContent += emoji.native;
    this.showEmojiPicker = false;
  }


  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.showEmojiPicker && !this.emojiContainer.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    }
  }


  checkForAtSymbol(event: any): void {
    const value = event.target.value;
    if (value.includes('@')) {
      const query = value.slice(value.lastIndexOf('@') + 1);
      this.showUserDropdown = true;
      this.filterUsers(query);
    } else {
      this.showUserDropdown = false;
      this.filterUsers(); 
    }
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


  triggerAtSymbol(): void {
    this.messageContent += '@';
    this.showUserDropdown = true;
    this.filterUsers();
  }  


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
