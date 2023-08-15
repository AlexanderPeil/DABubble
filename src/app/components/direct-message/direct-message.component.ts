import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Observable, Subscription, filter, map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  userSubscription!: Subscription;
  isOnline?: boolean;
  selectedUser: User | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(uid => !!uid),
      switchMap(uid => this.authService.getUserData(uid as string))
    ).subscribe(user => {
      this.selectedUser = user;
    });
  }



  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
