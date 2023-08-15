import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Subject, Subscription, combineLatest, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DirectMessageService } from 'src/app/shared/services/direct-message.service';
import { DirectMessageContent } from 'src/app/models/direct-message';

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
  private ngUnsubscribe = new Subject<void>();


  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private directMessageService: DirectMessageService) { }


  ngOnInit() {
    const selectedUser$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(uid => !!uid),
      switchMap(uid => this.authService.getUserData(uid as string))
    );

    const loggedInUser$ = this.authService.user$.pipe(
      tap(firebaseUser => {
        if (!firebaseUser?.uid) {
          this.loggedInUser = null;
        }
      }),
      switchMap(firebaseUser => firebaseUser?.uid ? this.authService.getUserData(firebaseUser.uid) : []),
      filter(user => !!user)
    );

    combineLatest([selectedUser$, loggedInUser$])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([selectedUser, loggedInUser]) => {
        this.selectedUser = selectedUser;
        this.loggedInUser = loggedInUser;

        if (loggedInUser && selectedUser) {
          this.directMessageService.getDirectMessages(loggedInUser.uid, selectedUser.uid)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((messages: any[]) => {
              this.messages = messages
                .map(msg => new DirectMessageContent(msg))
                .sort((a, b) => b.timestamp - a.timestamp);
            });
        } else {
          console.error("Either loggedInUser or selectedUser is null");
        }
      });
  }




  sendMessage() {
    if (this.messageContent && this.selectedUser && this.loggedInUser) {
      const chatMessage = new DirectMessageContent({
        senderId: this.loggedInUser.uid,
        content: this.messageContent,
        timestamp: Date.now()
      });

      this.directMessageService.addMessage(this.loggedInUser.uid, this.selectedUser.uid, chatMessage);
      this.messageContent = '';
    } else {
      console.error("Ein erforderliches Feld fehlt!");
    }
  }


  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  }


  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('en-US', options);
  }



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
