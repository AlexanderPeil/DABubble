import { Component, Inject } from '@angular/core';
import { Channel } from 'src/app/models/channel';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})


export class DialogEditChannelComponent {
  showInputToEditChannelName: boolean = false;
  showInputToEditChannelDescription: boolean = false;
  channel: any = new Channel();
  changedChannelName: string = '';
  changedChannelDescription: string = '';


  constructor(public router: Router, public channelService: ChannelService, @Inject(MAT_DIALOG_DATA) public data: {
    channelName: string, channelId: string, channelDescription: string
  }) {

  }


  openInputToEditChannelName() {
    this.showInputToEditChannelName = true;
  }


  getValueForNewChannelName($event: any) {
    this.changedChannelName = $event.toLowerCase();
  }


  closeInputToEditChannelNameAndSafeChanges() {
    this.showInputToEditChannelName = false;
    if (!this.showInputToEditChannelName) {
      this.channelService.updateChannelNameService(this.changedChannelName, this.data.channelId); // Get the ChannelId from @Inject in the Constructor.
    }
  }


  openInputToEditChannelDescription() {
    this.showInputToEditChannelDescription = true;
  }


  getValueForNewChannelDescription($event: any) {
    this.changedChannelDescription = $event;
  }


  closeInputToEditChannelDescriptionAndSafeChanges() {
    this.showInputToEditChannelDescription = false;
    if (!this.showInputToEditChannelDescription) {
      this.channelService.updateChannelDescriptionService(this.changedChannelDescription, this.data.channelId); // Get the ChannelId from @Inject in the Constructor.
    }
  }
}
