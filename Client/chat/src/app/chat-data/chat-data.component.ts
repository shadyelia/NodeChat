import { Component, OnInit } from "@angular/core";
import { IMessage } from "../models/message";
import { ChatService } from "../services/chat.service";

@Component({
  selector: "app-chat-data",
  templateUrl: "./chat-data.component.html",
  styleUrls: ["./chat-data.component.css"]
})
export class ChatDataComponent implements OnInit {
  message = "";
  allMessages: IMessage[] = [];
  token = Math.random().toString();

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe((message: IMessage) => {
      this.allMessages.push(message);
    });
  }

  sendMessage() {
    this.getDateFormat();

    let newMessage: IMessage = {
      message: this.message,
      sender: this.token,
      dateTime: this.getDateFormat()
    };

    this.chatService.sendMessage(newMessage);
    this.message = "";
  }

  getDateFormat(): string {
    let date = new Date();

    let monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    let dateString: string =
      date.getHours() +
      ":" +
      ("00" + date.getMinutes()).slice(-2) +
      " | " +
      monthNames[date.getMonth()] +
      " " +
      date.getDate();

    return dateString;
  }
}
