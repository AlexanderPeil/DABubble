import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
  Inject,
} from '@angular/core';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/user';
import { Channel } from 'src/app/models/channel';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-members-in-channel',
  templateUrl: './dialog-add-members-in-channel.component.html',
  styleUrls: ['./dialog-add-members-in-channel.component.scss'],
})
export class DialogAddMembersInChannelComponent implements OnInit {
  showUserDropdown: boolean = false;
  foundUsers: User[] = [];
  channel: Channel = new Channel();
  @ViewChild('input') input!: ElementRef;
  userAlreadyExists: boolean = false;
  selectedUsers: User[] = [];

  constructor(
    public channelService: ChannelService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channelId: string;
    }
  ) {}

  ngOnInit(): void {
    this.filterUsers();
    this.channel = this.channelService.channel;
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  filterUsers(query?: string): void {
    this.authService.getUsers(query).subscribe((users) => {
      this.foundUsers = users;
    });
  }

  selectUser(user: User): void {
    this.showUserDropdown = false;

    const userExists = this.channel.users.some(
      (existingUser: { uid: string }) => existingUser.uid === user.uid
    );

    if (!userExists) {
      // this.channel.users.push(user);
      this.selectedUsers.push(user);
    } else {
      // Der Benutzer existiert bereits, setzen Sie die Variable userAlreadyExists auf true
      this.userAlreadyExists = true;
      setTimeout(() => {
        this.userAlreadyExists = false; // Popup ausblenden
      }, 1500);
    }
  }

  addMembersToChannel() {
    this.channel.users.push(this.selectedUsers);
    this.channelService.updateChannelMembersService(
      this.data.channelId,
      this.selectedUsers
    );
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.input.nativeElement.contains(event.target)) {
      this.showUserDropdown = false;
    }
  }
}
