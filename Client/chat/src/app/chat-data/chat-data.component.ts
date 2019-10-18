import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { IMessage } from "../models/IMessage";
import { ChatService } from "../services/chat.service";
import { IUserList } from "../models/IUserList";
import { Observable } from "rxjs";

@Component({
  selector: "app-chat-data",
  templateUrl: "./chat-data.component.html",
  styleUrls: ["./chat-data.component.css"]
})
export class ChatDataComponent implements OnInit {
  messageForm: FormGroup;
  allMessages: IMessage[] = [];
  allUsers$: Observable<IUserList[]>;
  userName: string;
  selectedUser: IUserList;

  constructor(private fb: FormBuilder, private chatService: ChatService) {}

  ngOnInit() {
    this.userName = this.chatService.getUserName();
    this.allUsers$ = this.chatService.getUsers();
    this.chatService.getMessages().subscribe((message: IMessage) => {
      this.allMessages.push(message);
    });
    this.createForm();
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: [""]
    });
  }

  sendMessage() {
    if (this.selectUser) {
      let newMessage: IMessage = {
        message: this.messageForm.controls.message.value,
        dateTime: this.getDateFormat(),
        from: this.userName,
        to: this.selectedUser.userName
      };

      this.chatService.sendMessage(newMessage);
      this.messageForm.controls.message.setValue("");
    }
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

  selectUser(user: IUserList) {
    if (user) this.selectedUser = user;
  }
}
