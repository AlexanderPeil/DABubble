import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userSubscription!: Subscription;
  showMenu = false;
  isOnline?: boolean;

  constructor(
    private authService: AuthService,
    private _eref: ElementRef,
    public dialog: MatDialog) { }


  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(firebaseUser => {
      if (firebaseUser && firebaseUser.uid) {
        this.authService.getUserData(firebaseUser.uid).subscribe(userData => {
          if (userData) {
            this.user = userData;
            this.isOnline = userData.isOnline;
          } else {
            this.user = null;
            this.isOnline = undefined;
          }
        });
      } else {
        this.user = null;
        this.isOnline = undefined;
      }
    });
  }

  // this.userSubscription = this.authService.user$
  // .pipe(
  //   filter(firebaseUser => !!firebaseUser && !!firebaseUser.uid),
  //   switchMap(firebaseUser => this.authService.getUserData(firebaseUser.uid)),
  // )
  // .subscribe(userData => {
  //   if (userData) {
  //     this.user = userData;
  //     this.isOnline = userData.isOnline;
  //   } else {
  //     this.user = null;
  //     this.isOnline = undefined;
  //   }
  // });




  openDialog(): void {
    const dialogRef = this.dialog.open(DialogProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container'
    });
  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }


  @HostListener('document:click', ['$event'])
  clickout(event: { target: any; }) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
  }


  toggleMenu() {
    this.showMenu = !this.showMenu;
  }


  onLogout() {
    this.authService.signOut();
    this.showMenu = false;
  }

}
