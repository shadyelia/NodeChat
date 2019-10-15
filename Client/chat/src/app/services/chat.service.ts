import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  private url = "http://localhost:3000";

  constructor(private socket: Socket) {}

  public sendMessage(message: string) {
    this.socket.emit("send-message", message);
  }

  public getMessages = () => {
    return Observable.create(observer => {
      this.socket.on("new-message", (message: string) => {
        observer.next(message);
      });
    });
  };
}
