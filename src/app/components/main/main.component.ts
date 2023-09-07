import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { User } from 'src/app/shared/services/user';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnDestroy, OnInit {
  checkUserActivityInterval: any;
  logoutInterval!: number;
  userSubscription!: Subscription;
  lastUpdate: number = 0;
  updateUserActivityTimeout: any;


  constructor(
    public toggleWorspaceMenuService: ToggleWorkspaceMenuService,
    private authService: AuthService) {

  }


  ngOnInit() {
    this.checkUserActivityInterval = setInterval(() => {
      this.autoLogoutInactiveGuestUsers();
    }, 3600  * 1000);  
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


  autoLogoutInactiveGuestUsers() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.authService.getInactiveGuestUsers(oneHourAgo).subscribe((users: User[]) => {
      console.log(users);  
      users.forEach((user: User) => {
        if (user.lastActive && Date.now() - user.lastActive.toMillis() > 60 * 60 * 1000) {
          this.authService.deleteGuestUser(user.uid);
        }
      });
    });
  }
   
  
  

  ngOnDestroy() {
    clearInterval(this.checkUserActivityInterval);
    this.userSubscription?.unsubscribe();
  }

}
