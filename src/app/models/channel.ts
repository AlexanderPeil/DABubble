export class Channel {
  channelName: string;
  channelDescription: string;
  createDate: number;
  users: any;
  channelId: string;
  readBy?: string[];

  constructor(object?: any) {
    this.channelName = object ? object.channelName : '';
    this.channelDescription = object ? object.channelDescription : '';
    this.createDate = object ? object.createDate : null;
    this.users = object ? object.users : null;
    this.channelId = object ? object.channelId : null;
    this.readBy = object ? object.readBy : undefined;
  }

  toJSON() {
    const json: any = {
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      createDate: this.createDate,
      users: this.users,
      channelId: this.channelId
    };

    if (this.readBy) { 
      json.readBy = this.readBy;
    }

    return json;
  }

}
