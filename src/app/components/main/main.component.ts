import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/shared/services/message.service';
import { ThreadService } from 'src/app/shared/services/thread.service';

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
    public threadService: ThreadService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() {
    clearInterval(this.checkUserActivityInterval);
    this.userSubscription?.unsubscribe();
  }
}
