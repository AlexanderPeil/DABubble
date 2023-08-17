export class DirectMessageContent {
    content: string;
    timestamp: number;
    senderId: string;
  
    constructor(object?: any) {
      this.content = object ? object.content : '';
      this.timestamp = object ? object.timestamp : Date.now();
      this.senderId = object ? object.senderId : '';
    }
  
    public toJSON() {
      return {
        content: this.content,
        timestamp: this.timestamp,
        senderId: this.senderId
      };
    }
  }
  