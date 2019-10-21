import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";
import { IMessage } from "../models/IMessage";
import { IUserLogin } from "../models/IUserLogin";
import { IUserList } from "../models/IUserList";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  userName: string = "";
  constructor(private socket: Socket) {}

  public login(user: IUserLogin) {
    return Observable.create(observer => {
      this.socket.emit("login", user, (finish: boolean) => {
        observer.next(finish);
      });
    });
  }

  public sendMessage(message: IMessage) {
    this.socket.emit("sendMessage", message);
  }

  public getMessages() {
    return Observable.create(observer => {
      this.socket.on("newMessage", (message: IMessage) => {
        observer.next(message);
      });
    });
  }

  public getUsers() {
    return Observable.create(observer => {
      this.socket.on("usersList", (users: IUserList[]) => {
        observer.next(users);
      });
    });
  }

  public setUserName(userName: string) {
    this.userName = userName;
  }

  public getUserName(): string {
    return this.userName;
  }

  public getOldMessages(data: any) {
    this.socket.emit("getOldMessages", data);
    return Observable.create(observer => {
      this.socket.on("gotUserOldMessages", (message: IMessage) => {
        observer.next(message);
      });
    });
  }
}
