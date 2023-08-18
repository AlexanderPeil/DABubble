import { Component } from '@angular/core';
import { ChannelService } from 'src/app/shared/services/channel.service';


@Component({
  selector: 'app-dialog-add-members-in-channel',
  templateUrl: './dialog-add-members-in-channel.component.html',
  styleUrls: ['./dialog-add-members-in-channel.component.scss']
})


export class DialogAddMembersInChannelComponent {


  constructor(public channelService: ChannelService) {

  }
}
