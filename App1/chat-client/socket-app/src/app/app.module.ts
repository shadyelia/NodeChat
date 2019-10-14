import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { DocumentListComponent } from "./document-list/document-list.component";
import { DocumentComponent } from "./document/document.component";
import { FormsModule } from "@angular/forms";

import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";

const config: SocketIoConfig = { url: "http://localhost:4444", options: {} };

@NgModule({
  declarations: [AppComponent, DocumentListComponent, DocumentComponent],
  imports: [BrowserModule, FormsModule, SocketIoModule.forRoot(config)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
