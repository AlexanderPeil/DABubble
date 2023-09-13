import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
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
export class DialogCreateChannelComponent implements OnInit {
  channel: Channel = new Channel();
  showForm = true;
  radioSelected: boolean = false;
  isInputVisible: boolean = false;
  showUserDropdown: boolean = false;
  foundUsers: User[] = [];
  selectedUsers: any[] = [];
  inputValue: string = '';
  selectedRadioButtonValue!: string;
  @ViewChild('input') input!: ElementRef;
  userAlreadyExists: boolean = false;

  constructor(
    private channelService: ChannelService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.filterUsers();
  }

  toggleForms() {
    this.showForm = !this.showForm;
  }

  onRadioChange(event: MatRadioChange) {
    this.radioSelected = true;
    this.selectedRadioButtonValue = event.value;
    if (event.value === '2') {
      this.isInputVisible = true;
    } else {
      this.isInputVisible = false;
    }
  }

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
        const users = allUsers.map((user) => user);

        // Add the user IDs to the channel object
        this.channel.users = users;
      });
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

    const userExists = this.channel.users.some(
      (existingUser: { uid: string }) => existingUser.uid === user.uid
    );

    if (!userExists) {
      this.channel.users.push(user);
      this.selectedUsers.push(user);
    } else {
      // Der Benutzer existiert bereits, setzen Sie die Variable userAlreadyExists auf true
      this.userAlreadyExists = true;
      setTimeout(() => {
        this.userAlreadyExists = false; // Popup ausblenden
      }, 1500);
    }
  }

  async onSubmitWithMembers(channel: any) {
    if (this.selectedRadioButtonValue == '1') {
      debugger;
      await this.addAllMembers(); // Call addAllMembers only if radioSelected and user IDs are not defined

      // Call the addChannelService method to create the channel
      this.getValueForChannelNameAndConvertToLowerCase(channel.channelName);
      this.channelService.addChannelService(this.channel);
    } else {
      // Call the addChannelService method to create the channel without adding all members
      this.getValueForChannelNameAndConvertToLowerCase(channel.channelName);
      this.channelService.addChannelService(this.channel);
    }
  }

  // Used to convert channel names to lowercase to preserve alphabetical order.
  getValueForChannelNameAndConvertToLowerCase(channelName: string) {
    this.channel.channelName = channelName.toLowerCase();
  }

  getValueFromInput($event: any) {
    this.inputValue = $event;
  }
}
