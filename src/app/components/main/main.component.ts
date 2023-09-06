import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  checkUserActivityInterval: any;
  logoutInterval!: number;
  userSubscription!: Subscription;
  lastUpdate: number = 0;
  updateUserActivityTimeout: any;


  constructor(
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    private authService: AuthService) {

  }


  @HostListener('document:click', ['$event'])
  @HostListener('document:keyup', ['$event'])
  userActivity(event: Event) {
    this.debouncedUpdateUserActivity();
  }



  debouncedUpdateUserActivity() {
    const timeSinceLastUpdate = Date.now() - this.lastUpdate;
    if (timeSinceLastUpdate > 5 * 60 * 1000) {
      this.updateUserActivity();
    } else if (!this.updateUserActivityTimeout) {
      this.updateUserActivityTimeout = setTimeout(() => {
        this.updateUserActivity();
      }, (5 * 60 * 1000) - timeSinceLastUpdate);
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


  logoutInactiveUsers(): void {
    const currentTime = Date.now();
    const ONE_HOUR_IN_MILLISECONDS = 3600000;

    this.userSubscription = this.authService.getUsers().subscribe(users => {
      users.forEach(user => {
        if (user.lastActive) {
          const timeDifference = currentTime - user.lastActive.toMillis();
          if (timeDifference > ONE_HOUR_IN_MILLISECONDS && user.uid === this.authService.currentUser.value?.uid) {
            console.log(`Logging out current user with UID ${user.uid} due to inactivity.`);
            this.authService.signOut();
          }
        } else {
          console.warn(`User with UID ${user.uid} has no lastActive timestamp. Setting it now.`);
          this.authService.updateLastActive(user.uid);
        }
      });
    });
  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
