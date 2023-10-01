export class DirectMessage {
    readBy?: string[];

    constructor(object?: any) {
        this.readBy = object ? object.readBy: undefined;
    }

    toJSON() {
        const json: any = {
            
        }
    }
}
