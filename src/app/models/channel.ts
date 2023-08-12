export class Channel {
  channelName: string;
  channelDescription: string;
  createDate: number;

  constructor(object?: any) {
    this.channelName = object ? object.channelName : '';
    this.channelDescription = object ? object.channelDescription : '';
    this.createDate = object ? object.createDate : null;
  }

  public toJSON() {
    return {
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      createDate: this.createDate,
    };
  }
}
