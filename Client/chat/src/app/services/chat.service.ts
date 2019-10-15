import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";
import { IMessage } from "../models/message";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  private url = "http://localhost:3000";

  constructor(private socket: Socket) {}

  public sendMessage(message: IMessage) {
    this.socket.emit("send-message", message);
  }

  public getMessages = () => {
    return Observable.create(observer => {
      this.socket.on("new-message", (message: IMessage) => {
        observer.next(message);
      });
    });
  };
}
