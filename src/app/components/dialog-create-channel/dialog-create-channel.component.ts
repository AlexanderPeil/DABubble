import { Component, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Observable, map, switchMap } from 'rxjs';
import { Channel } from 'src/app/models/channel';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { MatRadioChange } from '@angular/material/radio';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss'],
})
export class DialogCreateChannelComponent {
  channel: Channel = new Channel();
  showForm = true;
  radioSelected = false;
  isInputVisible = false;

  constructor(
    private channelService: ChannelService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  toggleForms() {
    this.showForm = !this.showForm;
  }

  onRadioChange(event: MatRadioChange) {
    this.radioSelected = true;
    if (event.value === '2') {
      this.isInputVisible = true;
    } else {
      this.isInputVisible = false;
    }
  }

  // onSubmit(channel: any) {
  //   this.channelService.addChannelService(channel);
  // }

  async addAllMembers() {
    this.authService
      .getUsers()
      .pipe(
        map((allUsersData) =>
          allUsersData.map(
            (data) =>
              ({
                uid: data['uid'],
                email: data['email'],
                displayName: data['displayName'],
                emailVerified: data['emailVerified'],
                isOnline: data['isOnline'],
                photoURL: data['photoURL'],
              } as User)
          )
        )
      )
      .subscribe((allUsers) => {
        const users = allUsers.map((user) => user.uid);

        // Add the user IDs to the channel object
        this.channel.users = users;
      });
  }

  async onSubmitWithMembers(channel: any) {
    if (this.radioSelected && this.channel.users === undefined) {
      await this.addAllMembers(); // Call addAllMembers only if radioSelected and user IDs are not defined

      // Call the addChannelService method to create the channel
      this.channelService.addChannelService(this.channel);
    } else {
      // Call the addChannelService method to create the channel without adding all members
      this.channelService.addChannelService(this.channel);
    }
  }
}
