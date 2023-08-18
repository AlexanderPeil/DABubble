import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogShowMembersInChannelComponent } from '../dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Channel } from 'src/app/models/channel';


@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})


export class ChannelComponent implements OnInit {
  channelId!: string;
  channel: Channel = new Channel();


  constructor(public dialog: MatDialog, public toggleWorspaceMenuService: ToggleWorkspaceMenuService, public activatedRoute: ActivatedRoute, public channelService: ChannelService) {

  }


  ngOnInit(): void {
    this.getCurrentChannelIdInUrl();
  }


  getCurrentChannelIdInUrl() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.channelId = String(params.get('id'));
      this.channelService.getSingleChannelService(this.channelId);
    });
  }


  openDialogToEditChannel() {
    this.dialog.open(DialogEditChannelComponent);
    this.getCurrentChannelIdInUrl();
    this.channelService.getSingleChannelService(this.channelId);
  }


  openDialogToShowMembersInChannel() {
    this.dialog.open(DialogShowMembersInChannelComponent);
  }


  openDialogToAddMembersToChannel() {
    this.dialog.open(DialogAddMembersInChannelComponent);
    this.getCurrentChannelIdInUrl();
    this.channelService.getSingleChannelService(this.channelId);
  }
}
