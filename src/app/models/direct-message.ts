export class DirectMessageContent {
  id?: string;
  content: string;
  timestamp: number;
  senderId: string;
  read: boolean;

  constructor(object?: any) {
    this.id = object ? object.id : undefined;
    this.content = object ? object.content : '';
    this.timestamp = object ? object.timestamp : Date.now();
    this.senderId = object ? object.senderId : '';
    this.read = object ? object.read : '';
  }

  public toJSON() {
    return {
      content: this.content,
      timestamp: this.timestamp,
      senderId: this.senderId,
      read: this.read
    };
  }
}
