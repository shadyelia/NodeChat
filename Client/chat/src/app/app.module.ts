import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";

import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";

const config: SocketIoConfig = { url: "http://localhost:3000", options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, SocketIoModule.forRoot(config)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
