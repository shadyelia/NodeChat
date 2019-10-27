import {
  Component,
  OnInit,
  OnDestroy,
  QueryList,
  ElementRef,
  ViewChildren
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { IMessage, MessageType } from "../models/IMessage";
import { ChatService } from "../services/chat.service";
import { IUserList } from "../models/IUserList";
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import { PushNotificationsService } from "../services/push-notifications.service";
import { SubSink } from "subsink";
import { Observable, from } from "rxjs";
import { ISasToken, IUploadProgress } from "../models/azureStorage";
import { BlobStorageService } from "../services/blob-storage.service";
import { map, combineAll } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-chat-data",
  templateUrl: "./chat-data.component.html",
  styleUrls: ["./chat-data.component.css"]
})
export class ChatDataComponent implements OnInit, OnDestroy {
  @ViewChildren("messageContainer") messageContainers: QueryList<ElementRef>;

  subs = new SubSink();

  uploader: FileUploader = new FileUploader({
    isHTML5: true
  });

  hasBaseDropZoneOver: boolean = false;
  uploadProgress$: Observable<IUploadProgress[]>;
  filesSelected = false;

  messageForm: FormGroup;
  allMessages: IMessage[] = [];
  allUsers: IUserList[] = [];
  userName: string;
  selectedUser: IUserList;

  noUploadedFiles: boolean = false;
  filesList: IMessage[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chatService: ChatService,
    private notificationService: PushNotificationsService,
    private blobStorage: BlobStorageService
  ) {}

  ngOnInit() {
    this.notificationService.requestPermission();

    this.userName = this.chatService.getUserName();
    if (this.userName == "") this.router.navigateByUrl(`/`);

    this.subs.add(
      this.chatService.getUsers().subscribe((users: IUserList[]) => {
        this.allUsers = users;
      })
    );

    this.subs.add(
      this.chatService.getMessages().subscribe((message: IMessage) => {
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
            this.notify("Message from " + message.to, message.message);
          }
        } else if (message.to == this.userName) {
          this.allUsers.find(
            user => user.userName == message.from
          ).numberOfNewMessages += 1;
          this.notify("Message from " + message.to, message.message);
        }
      })
    );

    this.subs.add(
      this.chatService.makeMessagesReaded().subscribe(res => {
        this.allMessages.forEach(message => {
          message.isReaded = true;
        });
      })
    );

    this.createForm();
  }

  ngAfterViewInit() {
    this.subs.add(
      this.messageContainers.changes.subscribe(
        (list: QueryList<ElementRef>) => {
          this.scrollToBottom(); // For messages added later
        }
      )
    );
  }

  scrollToBottom() {
    let el = document.getElementById("message" + (this.allMessages.length - 1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  notify(title: string, alertContent: string) {
    let data: Array<any> = [];
    data.push({
      title: title,
      alertContent: alertContent
    });
    this.notificationService.generateNotification(data);
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: ["", Validators.required]
    });
  }

  sendMessage() {
    if (this.noUploadedFiles) {
      this.sendNormalMessage();
    } else {
      this.sendFiles();
    }
  }

  sendNormalMessage() {
    if (this.messageForm.valid) {
      if (this.selectedUser) {
        let newMessage: IMessage = {
          message: this.messageForm.controls.message.value,
          creationTime: new Date(),
          from: this.userName,
          to: this.selectedUser.userName,
          dateTime: "",
          isReaded: false,
          type: MessageType.NormalMessage,
          fileName: ""
        };

        this.chatService.sendMessage(newMessage);
        this.messageForm.controls.message.setValue("");
      }
    }
  }

  sendFiles() {
    this.sendNormalMessage();
    this.filesList.forEach(file => {
      this.chatService.sendMessage(file);
    });
    this.noUploadedFiles = true;
    this.filesSelected = false;
    this.uploader = new FileUploader({
      isHTML5: true
    });
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
    this.subs.add(
      this.chatService.getOldMessages(data).subscribe(Messages => {
        Messages.forEach(message => {
          message.dateTime = this.getDateFormat(message.creationTime);
        });
        this.allMessages = Messages;
      })
    );
    this.selectedUser.numberOfNewMessages = 0;
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onFileChange(): void {
    this.filesSelected = true;

    this.uploadProgress$ = from(this.uploader.queue).pipe(
      map(file => this.uploadFile(file["some"])),
      combineAll()
    );
  }

  uploadFile(file: File): Observable<IUploadProgress> {
    const accessToken: ISasToken = {
      container: environment.azureStorage.containerName,
      filename: file.name,
      storageAccessToken: environment.azureStorage.storageAccessToken,
      storageUri: environment.azureStorage.storageUri
    };

    let newMessage: IMessage = {
      message:
        environment.azureStorage.storageUri +
        "/" +
        environment.azureStorage.containerName +
        "/" +
        file.name +
        environment.azureStorage.storageAccessToken,
      creationTime: new Date(),
      from: this.userName,
      to: this.selectedUser.userName,
      dateTime: "",
      isReaded: false,
      type: file.type.includes("image")
        ? MessageType.ImageLink
        : MessageType.FileLink,
      fileName: file.name
    };

    this.filesList.push(newMessage);
    this.noUploadedFiles = false;

    return this.blobStorage
      .uploadToBlobStorage(accessToken, file)
      .pipe(map(progress => this.mapProgress(file, progress)));
  }

  private mapProgress(file: File, progress: number): IUploadProgress {
    return {
      filename: file.name,
      progress: progress
    };
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
