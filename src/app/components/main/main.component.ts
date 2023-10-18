import { Component } from '@angular/core';
import { ThreadService } from 'src/app/shared/services/thread.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  // checkUserActivityInterval: any;
  // logoutInterval!: number;
  // userSubscription!: Subscription;
  // lastUpdate: number = 0;
  // updateUserActivityTimeout: any;
  // inactiveGuestUserSubscription!: Subscription;
  isSidenavOpen = true;

  constructor(public threadService: ThreadService) { }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

}
