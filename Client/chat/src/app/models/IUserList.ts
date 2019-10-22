export interface IUserList {
  _id: number;
  token: string;
  userName: string;
  isOnline: boolean;
  numberOfNewMessages: number;
  lastMessage: string;
  dateLastMessage: Date;
}
