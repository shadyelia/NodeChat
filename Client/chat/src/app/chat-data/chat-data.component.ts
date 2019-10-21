import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { IMessage } from "../models/IMessage";
import { ChatService } from "../services/chat.service";
import { IUserList } from "../models/IUserList";
import { Observable } from "rxjs";
import { FileUploader } from "ng2-file-upload/ng2-file-upload";

@Component({
  selector: "app-chat-data",
  templateUrl: "./chat-data.component.html",
  styleUrls: ["./chat-data.component.css"]
})
export class ChatDataComponent implements OnInit {
  uploader: FileUploader = new FileUploader({
    url: "https://evening-anchorage-3159.herokuapp.com/api/",
    isHTML5: true
  });
  hasBaseDropZoneOver: boolean = false;

  messageForm: FormGroup;
  allMessages: IMessage[] = [];
  allUsers: IUserList[] = [];
  userName: string;
  selectedUser: IUserList;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.userName = this.chatService.getUserName();
    if (this.userName == "") this.router.navigateByUrl(`/`);

    this.chatService.getUsers().subscribe((users: IUserList[]) => {
      users.forEach(user => {
        user.numberOfNewMessages = 0;
      });
      this.allUsers = users;
    });

    this.chatService.getMessages().subscribe((message: IMessage) => {
      console.log(message);
      if (this.selectedUser) {
        if (
          message.from == this.selectedUser.userName ||
          message.to == this.selectedUser.userName
        ) {
          message.dateTime = this.getDateFormat(
            message.creationTime.toString()
          );
          this.allMessages.push(message);
        } else if (message.to == this.userName) {
          this.allUsers.find(
            user => user.userName == message.from
          ).numberOfNewMessages += 1;
        }
      } else if (message.to == this.userName) {
        this.allUsers.find(
          user => user.userName == message.from
        ).numberOfNewMessages += 1;
      }
    });
    this.createForm();
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: [""]
    });
  }

  sendMessage() {
    if (this.selectedUser) {
      let newMessage: IMessage = {
        message: this.messageForm.controls.message.value,
        creationTime: new Date(),
        from: this.userName,
        to: this.selectedUser.userName,
        dateTime: ""
      };

      this.chatService.sendMessage(newMessage);
      this.messageForm.controls.message.setValue("");
    }
  }

  getDateFormat(dateInput: string): string {
    let date = new Date(dateInput);

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
    this.allMessages = [];
    var data = {
      from: this.userName,
      to: user.userName
    };
    this.chatService.getOldMessages(data).subscribe(Messages => {
      this.allMessages = Messages;
      Messages.forEach(message => {
        message.dateTime = this.getDateFormat(message.creationTime);
      });
    });
    this.selectedUser.numberOfNewMessages = 0;
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
}
