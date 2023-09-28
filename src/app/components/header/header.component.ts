import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription, switchMap, tap } from 'rxjs';
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
  user_images = '../assets/img/avatar1.svg';

  constructor(
    private authService: AuthService,
    private _eref: ElementRef,
    public dialog: MatDialog) { }


  ngOnInit() {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.isOnline = user?.isOnline ?? undefined;
    });
  }


  retryLoadImage(user: User | null) {
    if (user) {
      user.photoURL = this.user_images;
    }
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogProfileComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'custom-dialog-container'
    });
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


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

}
