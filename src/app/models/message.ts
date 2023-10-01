export class MessageContent {
  id?: string;
  content: string;
  timestamp: number;
  senderId: string;
  receiverId?: string;
  senderName: string;
  senderImage: string;
  hasThread: boolean = false;
  messageId?: string;
  emojis?: {
    complete?: number;
    handsUp?: number;
    rocket?: number;
    nerdSmiley?: number;
  }

  constructor(object?: any) {
    this.id = object ? object.id : undefined;
    this.content = object ? object.content : '';
    this.timestamp = object ? object.timestamp : Date.now();
    this.senderId = object ? object.senderId : '';
    this.receiverId = object ? object.receiverId : '';
    this.senderName = object ? object.senderName : '';
    this.senderImage = object ? object.senderImage : '';
    this.hasThread = object ? object.hasThread : false;
    this.messageId = object ? object.messageId : '';
    this.emojis = object ? object.emojis || {} : {};
  }

  public toJSON(): any {
    const json: any = {
      content: this.content,
      timestamp: this.timestamp,
      senderId: this.senderId,
      senderName: this.senderName,
      senderImage: this.senderImage,
      hasThread: this.hasThread,
      emojis: this.emojis || {} 
    };

    if (this.receiverId) {
      json.receiverId = this.receiverId;
    }

    if (this.messageId) {
      json.messageId = this.messageId;
    }

    return json;
  }

}
