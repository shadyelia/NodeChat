import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable, observable } from "rxjs";
import { IMessage } from "../models/message";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  constructor(private socket: Socket) {}

  public login(userName: string) {
    return Observable.create(observer => {
      this.socket.emit("new-user", userName, (exist: boolean) => {
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
}
