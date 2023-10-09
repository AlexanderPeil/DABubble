import { Injectable } from '@angular/core';
import { User } from 'src/app/shared/services/user';
import { ChannelService } from './channel.service';
import { Channel } from 'src/app/models/channel';
import 'quill-mention';
import * as Emoji from 'quill-emoji';
import Quill from 'quill';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
Quill.register('modules/emoji', Emoji);

@Injectable({
  providedIn: 'root',
})
export class QuillService {
  quill: any;
  selectedChannelIdSubject = new BehaviorSubject<string | null>(null);



  // public quillModules = {
  //   'emoji-toolbar': true,
  //   'emoji-textarea': true,
  //   'emoji-shortname': true,
  //   mention: {
  //     allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
  //     mentionDenotationChars: ['@'],
  //     source: this.searchUsers.bind(this),
  //     renderItem(item: any) {
  //       const div = document.createElement('div');
  //       const img = document.createElement('img');
  //       const span = document.createElement('span');

  //       img.src = item.photoURL;
  //       img.classList.add('user-dropdown-image');
  //       span.textContent = item.displayName;

  //       img.onerror = () => this.setDefaultImageOnError(img);

  //       div.appendChild(img);
  //       div.appendChild(span);

  //       return div;
  //     },
  //     onSelect: (item: any, insertItem: (arg0: any) => void) => {
  //       insertItem(item);
  //     },
  //   },
  // };

  // public quillModulesWithAtAndHash = {
  //   toolbar: false,
  //   mention: {
  //     allowedChars: /^[A-Za-z\sÅÄÖåäö.]*$/,
  //     mentionDenotationChars: ['@', '#', '*'],
  //     source: (
  //       searchTerm: string,
  //       renderList: Function,
  //       mentionChar: string
  //     ) => {
  //       if (mentionChar === '@') {
  //         this.searchUsers(searchTerm, renderList);
  //       } else if (mentionChar === '#') {
  //         this.searchChannels(searchTerm, renderList);
  //       } else if (mentionChar === '*') {
  //         this.searchEmails(searchTerm, renderList);
  //       }
  //     },
  //     renderItem(item: any) {
  //       const div = document.createElement('div');

  //       if (item.type === 'user') {
  //         const dropdownDiv = document.createElement('div');
  //         const img = document.createElement('img');
  //         const contentDiv = document.createElement('div');
  //         const span = document.createElement('span');
  //         const emailSpan = document.createElement('span');

  //         img.src = item.photoURL;
  //         img.classList.add('user-dropdown-image');
  //         span.textContent = item.displayName;
  //         emailSpan.textContent = item.email;

  //         contentDiv.appendChild(span);
  //         contentDiv.appendChild(emailSpan);
  //         contentDiv.classList.add('user-dropdown-text');

  //         dropdownDiv.appendChild(img);
  //         dropdownDiv.appendChild(contentDiv);
  //         dropdownDiv.classList.add('user-dropdown-container');

  //         div.appendChild(dropdownDiv);
  //       } else if (item.type === 'channel') {
  //         const span = document.createElement('span');

  //         span.textContent = `#${item.displayName}`;

  //         div.appendChild(span);
  //       }

  //       return div;
  //     },
  //     onSelect: (item: any, insertItem: (arg0: any) => void) => {
  //       insertItem(item);
  //     },
  //   },
  // };

  constructor(
    private authService: AuthService,
    public channelService: ChannelService
  ) { }

  setFocus(editor: any): void {
    this.quill = editor;
    editor.focus();
  }

  searchUsers(searchTerm: string, renderList: Function) {
    this.authService.getUsers(searchTerm).subscribe((users: User[]) => {
      const user_images = '../assets/img/avatar1.svg';
      const values = users.map((user) => {
        let photoURL = user.photoURL;
        if (!photoURL) {
          photoURL = user_images;
        }
        return {
          id: user.uid,
          value: user.displayName,
          photoURL: photoURL,
          displayName: user.displayName,
          email: user.email,
          type: 'user',
        };
      });
      renderList(values, searchTerm);
    });
  }

  searchChannels(searchTerm: string, renderList: Function) {
    this.channelService
      .getChannels(searchTerm)
      .subscribe((channels: Channel[]) => {
        const values = channels.map((channel) => ({
          id: channel.channelId, // Stellen Sie sicher, dass Ihre Channels eine eindeutige ID haben
          value: channel.channelName,
          displayName: channel.channelName,
          type: 'channel',
        }));
        renderList(values, searchTerm);
      });
  }

  searchEmails(searchTerm: string, renderList: Function) {
    this.authService
      .getUsersWithEmail(searchTerm)
      .subscribe((users: User[]) => {
        const user_images = '../assets/img/avatar1.svg';
        const values = users.map((user) => {
          let photoURL = user.photoURL;
          if (!photoURL) {
            photoURL = user_images;
          }
          return {
            id: user.uid,
            value: user.email,
            photoURL: photoURL,
            displayName: user.displayName,
            email: user.email,
            type: 'user',
          };
        });
        renderList(values, searchTerm);
      });
  }


  renderItem = (item: any) => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    const span = document.createElement('span');

    img.src = item.photoURL;
    img.classList.add('user-dropdown-image');
    span.textContent = item.displayName;

    img.onerror = () => this.setDefaultImageOnError(img);

    div.appendChild(img);
    div.appendChild(span);

    return div;
  }


  public quillModules = {
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: this.searchUsers.bind(this),
      renderItem: this.renderItem,  // Verweis auf die außerhalb definierte Methode
      onSelect: (item: any, insertItem: (arg0: any) => void) => {
        insertItem(item);
      },
    },
  };

  renderItemWithAtAndHash = (item: any) => {
    const div = document.createElement('div');

    if (item.type === 'user') {
      const dropdownDiv = document.createElement('div');
      const img = document.createElement('img');
      const contentDiv = document.createElement('div');
      const span = document.createElement('span');
      const emailSpan = document.createElement('span');

      img.src = item.photoURL;
      img.classList.add('user-dropdown-image');
      span.textContent = item.displayName;
      emailSpan.textContent = item.email;

      img.onerror = () => this.setDefaultImageOnError(img);

      contentDiv.appendChild(span);
      contentDiv.appendChild(emailSpan);
      contentDiv.classList.add('user-dropdown-text');

      dropdownDiv.appendChild(img);
      dropdownDiv.appendChild(contentDiv);
      dropdownDiv.classList.add('user-dropdown-container');

      div.appendChild(dropdownDiv);
    } else if (item.type === 'channel') {
      console.log(item);
      
      const span = document.createElement('span');
      span.textContent = `#${item.displayName}`;
      div.setAttribute('data-channel-id', item.id);  
      div.addEventListener('mouseup', () => {
        console.log('Channel selected:', item.id);
        this.selectedChannelIdSubject.next(item.id);
    });
      div.appendChild(span);
    }

    return div;
  }


  public quillModulesWithAtAndHash = {
    toolbar: false,
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö.]*$/,
      mentionDenotationChars: ['@', '#', '*'],
      source: (
        searchTerm: string,
        renderList: Function,
        mentionChar: string
      ) => {
        if (mentionChar === '@') {
          this.searchUsers(searchTerm, renderList);
        } else if (mentionChar === '#') {
          this.searchChannels(searchTerm, renderList);
        } else if (mentionChar === '*') {
          this.searchEmails(searchTerm, renderList);
        }
      },
      renderItem: this.renderItemWithAtAndHash,  // Verweis auf die außerhalb definierte Methode
      onSelect: (item: any, insertItem: (arg0: any) => void) => {
        insertItem(item);
      },
    },
  };


  triggerAtSymbol() {
    this.quill.focus();
    setTimeout(() => {
      const currentPosition = this.quill.getSelection()?.index || 0;
      this.quill.insertText(currentPosition, '@ ');
      this.quill.setSelection(currentPosition + 1);
    }, 0);
  }


  setDefaultImageOnError(imgElement: HTMLImageElement) {
    imgElement.src = '../assets/img/avatar1.svg';
  }
}
