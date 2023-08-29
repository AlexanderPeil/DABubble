import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogShowMembersInChannelComponent } from '../dialog-show-members-in-channel/dialog-show-members-in-channel.component';
import { DialogAddMembersInChannelComponent } from '../dialog-add-members-in-channel/dialog-add-members-in-channel.component';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { Channel } from 'src/app/models/channel';
import { StorageService } from 'src/app/shared/services/storage.service';


@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})


export class ChannelComponent implements OnInit {
  channelId!: string;
  channel: Channel = new Channel();


  constructor(public dialog: MatDialog, public toggleWorspaceMenuService: ToggleWorkspaceMenuService, public activatedRoute: ActivatedRoute, public channelService: ChannelService, public storageService: StorageService) {

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
    this.dialog.open(DialogEditChannelComponent, {
      data: {
        channelId: this.channelId,
        channelName: this.channelService.channel.channelName,
        channelDescription: this.channelService.channel.channelDescription,
      }
    });
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


  chooseFiletoUpload($event: any) {
    this.storageService.chooseFileSevice($event);
  }


  // selectionChanged($event: any) {
  //   if ($event.oldRange == null) {
  //     this.onfocus($event);
  //   }
  //   if ($event.range == null) {
  //     this.onBlur($event);
  //   }
  // }


  // onfocus($event: any) {
  //   $event.editor.root.style.border = '1px solid #797EF3';
  //   $event.editor.root.style.borderTopRightRadius = '20px';
  //   $event.editor.root.style.borderTopLeftRadius = '20px';
  //   $event.editor.root.style.borderBottom = 'unset';
  //   $event.editor.theme.modules.toolbar.container.style.border = '1px solid #797EF3';
  //   $event.editor.theme.modules.toolbar.container.style.borderTop = 'unset';
  // }


  // onBlur($event: any) {
  //   $event.editor.root.style.border = '1px solid #ADB0D9';
  //   $event.editor.root.style.borderBottom = 'unset';
  //   $event.editor.theme.modules.toolbar.container.style.border = '1px solid #ADB0D9';
  //   $event.editor.theme.modules.toolbar.container.style.borderTop = 'unset';
  // }


  // setFocusOnEditor($event: any) {
  //   $event.focus();
  // }


  // getEditorInstance($event: any) {
  //   let toolbar = $event.getModule('toolbar');
  //   console.log(toolbar);
  //   toolbar.addHandler('image', this.storageService.donwnloadUrlToDisplayUploadedData);
  // }
}
