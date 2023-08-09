import { Component } from '@angular/core';


@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})


export class DialogEditChannelComponent {
  showInputToEditChannelName: boolean = false;
  showInputToEditChannelDescription: boolean = false;


  openInputToEditChannelName() {
    this.showInputToEditChannelName = true;
  }


  closeInputToEditChannelName() {
    this.showInputToEditChannelName = false;
  }


  openInputToEditChannelDescription() {
    this.showInputToEditChannelDescription = true;
  }


  closeInputToEditChannelDescription() {
    this.showInputToEditChannelDescription = false;
  }
}
