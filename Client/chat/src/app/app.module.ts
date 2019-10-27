import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material";

import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { LoginComponent } from "./login/login.component";
import { ChatDataComponent } from "./chat-data/chat-data.component";
import { AppRoutingModule } from "./app-routing.module";
import { FileUploadModule } from "ng2-file-upload/ng2-file-upload";
import { BLOB_STORAGE_TOKEN, IAzureStorage } from "./models/azureStorage";

const config: SocketIoConfig = { url: "http://localhost:3000", options: {} };

declare var AzureStorage: IAzureStorage;

@NgModule({
  declarations: [AppComponent, LoginComponent, ChatDataComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FileUploadModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    {
      provide: BLOB_STORAGE_TOKEN,
      useValue: AzureStorage.Blob
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
