export class MessageContent {
  id?: string;
  content: string;
  timestamp: number;
  senderId: string;
  receiverId?: string;
  senderImage: string;
  read: boolean;

  constructor(object?: any) {
    this.id = object ? object.id : undefined;
    this.content = object ? object.content : '';
    this.timestamp = object ? object.timestamp : Date.now();
    this.senderId = object ? object.senderId : '';
    this.receiverId = object ? object.receiverId : '';
    this.senderImage = object ? object.senderImage : '';
    this.read = object ? object.read : '';
  }

  public toJSON(): any {
    const json: any = {
      content: this.content,
      timestamp: this.timestamp,
      senderId: this.senderId,
      senderImage: this.senderImage,
      read: this.read
    };
  
    if (this.receiverId) {
      json.receiverId = this.receiverId;
    }
  
    return json;
  }
  
}
