import { Component, NgZone, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor
    (private auth: Auth,
      private router: Router,
      private authService: AuthService,
      private ngZone: NgZone) {
  }


  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.ngZone.run(() => {
        if (user) {
          this.router.navigate(['/main']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }

}
