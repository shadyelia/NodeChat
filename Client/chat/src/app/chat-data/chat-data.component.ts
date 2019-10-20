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
  allUsers$: Observable<IUserList[]>;
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
    this.allUsers$ = this.chatService.getUsers();
    this.chatService.getMessages().subscribe((message: IMessage) => {
      if (this.selectedUser) {
        if (
          message.from == this.selectedUser.userName ||
          message.to == this.selectedUser.userName
        ) {
          this.allMessages.push(message);
        }
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
    this.allMessages = [];
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
}
