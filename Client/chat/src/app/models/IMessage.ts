export interface IMessage {
  message: string;
  creationTime: Date;
  from: string;
  to: string;
  dateTime: string;
  type: MessageType;
  isReaded: boolean;
  fileName: string;
}

export enum MessageType {
  NormalMessage = 0,
  FileLink = 1,
  ImageLink = 2
}
