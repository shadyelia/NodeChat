import { Component, OnInit } from "@angular/core";
import { IMessage } from "../models/IMessage";
import { ChatService } from "../services/chat.service";
import { IUserList } from "../models/IUserList";

@Component({
  selector: "app-chat-data",
  templateUrl: "./chat-data.component.html",
  styleUrls: ["./chat-data.component.css"]
})
export class ChatDataComponent implements OnInit {
  message: string = "";
  allMessages: IMessage[] = [];
  allUsers: IUserList[] = [];
  userName: String;
  token: string = "";

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.userName = localStorage.getItem("userName");
    this.chatService.getUsers().subscribe((users: IUserList[]) => {
      console.log(users);
      this.allUsers = users;
    });
    this.chatService.getMessages().subscribe((message: IMessage) => {
      this.allMessages.push(message);
    });
  }

  sendMessage() {
    this.getDateFormat();

    let newMessage: IMessage = {
      message: this.message,
      dateTime: this.getDateFormat(),
      token: this.token
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
