import { Injectable } from '@angular/core';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from './channel.service';
import { Channel } from 'src/app/models/channel';
import 'quill-mention';
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
import { AuthService } from './auth.service';
Quill.register('modules/emoji', Emoji);

@Injectable({
  providedIn: 'root',
})
export class QuillService {
  quill: any;

  public quillModules = {
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: this.searchUsers.bind(this),
      renderItem(item: any) {
        const div = document.createElement('div');
        const img = document.createElement('img');
        const span = document.createElement('span');

        img.src = item.photoURL;
        img.classList.add('user-dropdown-image');
        span.textContent = item.displayName;

        div.appendChild(img);
        div.appendChild(span);

        return div;
      },
      onSelect: (item: any, insertItem: (arg0: any) => void) => {
        insertItem(item);
      },
    },
  };

  public quillModulesWithHash = {
    toolbar: false,
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['#'],
      source: this.searchChannels.bind(this),
      renderItem(item: any) {
        const div = document.createElement('div');
        const img = document.createElement('img');
        const span = document.createElement('span');

        img.src = item.photoURL;
        img.classList.add('user-dropdown-image');
        span.textContent = item.displayName;

        div.appendChild(img);
        div.appendChild(span);

        return div;
      },
      onSelect: (item: any, insertItem: (arg0: any) => void) => {
        insertItem(item);
      },
    },
  };

  constructor(
    private authService: AuthService,
    public channelService: ChannelService
  ) {}

  setFocus(editor: any): void {
    this.quill = editor;
    editor.focus();
  }

  searchUsers(searchTerm: string, renderList: Function) {
    this.authService.getUsers(searchTerm).subscribe((users: User[]) => {
      const values = users.map((user) => ({
        id: user.uid,
        value: user.displayName,
        photoURL: user.photoURL,
        displayName: user.displayName,
      }));
      renderList(values, searchTerm);
    });
  }

  searchChannels(searchTerm: string, renderList: Function) {
    console.log('searchChannels called with searchTerm:', searchTerm);

    this.channelService
      .getChannels(searchTerm)
      .subscribe((channels: Channel[]) => {
        const values = channels.map((channel) => ({
          id: channel.channelName, // Stellen Sie sicher, dass Ihre Channels eine eindeutige ID haben
          value: channel.channelName,
          displayName: channel.channelName,
        }));
        renderList(values, searchTerm);
      });
  }

  // searchMentions(mentionText: string, renderList: Function) {
  //   console.log('searchMentions called with mentionText:', mentionText);
  //   // Überprüfen Sie, ob der Text mit "@" oder "#" beginnt, um Benutzer oder Channels zu suchen.
  //   if (mentionText.startsWith('@')) {
  //     const userSearchTerm = mentionText.substr(1); // Entfernen Sie das "@"-Zeichen
  //     this.searchUsers(userSearchTerm, renderList);
  //   } else if (mentionText.startsWith('#')) {
  //     const channelSearchTerm = mentionText.substr(1); // Entfernen Sie das "#" -Zeichen
  //     this.searchChannels(channelSearchTerm, renderList);
  //   } else {
  //     // Wenn weder "@" noch "#" vorhanden ist, geben Sie ein leeres Array zurück.
  //     renderList([]);
  //   }
  // }

  triggerAtSymbol() {
    this.quill.focus();
    setTimeout(() => {
      const currentPosition = this.quill.getSelection()?.index || 0;
      this.quill.insertText(currentPosition, '@ ');
      this.quill.setSelection(currentPosition + 1);
    }, 0);
  }
}
