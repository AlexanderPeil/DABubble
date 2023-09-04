import { Component, OnInit } from '@angular/core';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Channel } from 'src/app/models/channel';

@Component({
  selector: 'app-dialog-add-members-in-channel',
  templateUrl: './dialog-add-members-in-channel.component.html',
  styleUrls: ['./dialog-add-members-in-channel.component.scss'],
})
export class DialogAddMembersInChannelComponent implements OnInit {
  showUserDropdown: boolean = false;
  foundUsers: User[] = [];
  channel: Channel = new Channel();

  constructor(
    public channelService: ChannelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.filterUsers();
    this.channel = this.channelService.channel;
  }

  filterUsers(query?: string): void {
    this.authService.getUsers(query).subscribe((users) => {
      this.foundUsers = users;
    });
  }

  selectUser(user: User): void {
    this.showUserDropdown = false;

    if (!this.channel.users) {
      this.channel.users = []; // Initialisieren Sie das Array, wenn es noch nicht existiert
    }
    this.channel.users.push(user.uid);
  }

  checkForDropdown(event: any): void {
    const value = event.target.value;
    if (value) {
      this.showUserDropdown = true;
      this.filterUsers(value);
    } else if (value == 0) {
      this.showUserDropdown = true;
      this.filterUsers();
    } else {
      this.showUserDropdown = false;
      this.filterUsers();
    }
  }
}
