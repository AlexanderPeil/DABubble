import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  private userSubscription?: Subscription;

  constructor
    (private router: Router,
      private authService: AuthService,
      private ngZone: NgZone) {
  }


  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.ngZone.run(() => {
        if (user) {
          this.router.navigate(['/main']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

}
