import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { User } from 'src/app/shared/services/user';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy, OnInit {
  checkUserActivityInterval: any;
  logoutInterval!: number;
  userSubscription!: Subscription;
  lastUpdate: number = 0;
  updateUserActivityTimeout: any;
  inactiveGuestUserSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    public threadService: ThreadService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
  }

  // @HostListener('document:click', ['$event'])
  // @HostListener('document:keyup', ['$event'])
  // userActivity(event: Event) {
  //   this.debouncedUpdateUserActivity();
  // }

  debouncedUpdateUserActivity() {
    const timeSinceLastUpdate = Date.now() - this.lastUpdate;
    if (timeSinceLastUpdate > 30 * 60 * 1000) {
      this.updateUserActivity();
    } else if (!this.updateUserActivityTimeout) {
      this.updateUserActivityTimeout = setTimeout(() => {
        this.updateUserActivity();
      }, 5 * 60 * 1000 - timeSinceLastUpdate);
    }
  }

  updateUserActivity() {
    if (this.authService.currentUser.value) {
      this.authService.updateLastActive(this.authService.currentUser.value.uid);
      this.lastUpdate = Date.now();
      clearTimeout(this.updateUserActivityTimeout);
      this.updateUserActivityTimeout = null;
    }
  }

  autoLogoutInactiveGuestUsers() {
    this.inactiveGuestUserSubscription?.unsubscribe();
    this.inactiveGuestUserSubscription = this.authService
      .getInactiveGuestUsers()
      .subscribe((users: User[]) => {
        users.forEach((user: User) => {
          if (
            user.lastActive &&
            Date.now() - user.lastActive.toMillis() > 60 * 60 * 1000
          ) {
            this.authService.deleteGuestUser(user.uid);
          }
        });
      });
  }

  ngOnDestroy() {
    clearInterval(this.checkUserActivityInterval);
    this.userSubscription?.unsubscribe();
    this.inactiveGuestUserSubscription?.unsubscribe();
  }
}
