import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";
import { IMessage } from "../models/IMessage";
import { IUser } from "../models/IUser";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  constructor(private socket: Socket) {}

  public login(user: IUser) {
    return Observable.create(observer => {
      this.socket.emit("new-user", user, (exist: boolean) => {
        observer.next(exist);
      });
    });
  }

  public sendMessage(message: IMessage) {
    this.socket.emit("send-message", message);
  }

  public getMessages() {
    return Observable.create(observer => {
      this.socket.on("new-message", (message: IMessage) => {
        observer.next(message);
      });
    });
  }

  public getUsers() {
    return Observable.create(observer => {
      this.socket.on("usernames", (users: any) => {
        observer.next(users);
      });
    });
  }
}
