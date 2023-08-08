import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isOnline: boolean = false;
  userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private location: Location) { }

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.getUserStatus(user.uid).subscribe(onlineStatus => {
          this.isOnline = onlineStatus;
        });
      }
    });
  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }


  goBack(): void {
    this.location.back();
  }
}
