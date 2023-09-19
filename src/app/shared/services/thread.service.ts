import { Injectable } from '@angular/core';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/services/user';
// import { AuthService } from 'src/app/shared/services/auth.service';
// import { ActivatedRoute } from '@angular/router';
import { MessageContent } from 'src/app/models/message';
import { Observable, of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class ThreadService {
  threadAreClosed: boolean = false;
  loggedInUser: User | null = null;


  constructor(
    public channelService: ChannelService,
    private router: Router,
    private messageService: MessageService) {

  }


  openThreadService(messageId: string, channelId?: string) {
    this.threadAreClosed = true;
    if (channelId) {
      this.router.navigate(['/main', 'channel', channelId, 'thread', messageId, channelId]);
    } else {
      this.router.navigate(['/main', 'direct-message', messageId, 'thread', messageId]);
    }
  }


  loadThreadData(messageId: string, channelId?: string | null): Observable<MessageContent | null> {
    if (channelId && messageId) {
      return this.messageService.getMessageById(channelId, messageId);
    }
    return of(null);
  }


  closeThreadService() {
    this.threadAreClosed = false;
  }
}
