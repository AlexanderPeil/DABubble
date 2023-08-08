import { Component } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  channelsVisible: boolean = true;
  chatsVisible: boolean = true;
  arrowImageRotated: boolean = false;

  hideChannels() {
    this.channelsVisible = !this.channelsVisible;
    this.arrowImageRotated = !this.arrowImageRotated;
  }
  hideChats() {
    this.chatsVisible = !this.chatsVisible;
    this.arrowImageRotated = !this.arrowImageRotated;
  }
}
