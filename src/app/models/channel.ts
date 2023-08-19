export class Channel {
  channelName: string;
  channelDescription: string;
  createDate: number;
  users: any;

  constructor(object?: any) {
    this.channelName = object ? object.channelName : '';
    this.channelDescription = object ? object.channelDescription : '';
    this.createDate = object ? object.createDate : null;
    this.users = object ? object.users : null;
  }

  toJSON() {
    return {
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      createDate: this.createDate,
      users: this.users,
    };
  }
}
