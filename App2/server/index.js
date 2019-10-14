const app = require("express")();

let http = require("http");
let server = http.Server(app);

let socketIO = require("socket.io");
let io = socketIO(server);

const port = process.env.PORT || 3000;

messages = {}; //db

io.on("connection", socket => {
  console.log("user connected");

  socket.on("new-message", message => {
    io.emit(message);
  });

  socket.on("get-messages", docId => {
    safeJoin(docId);
    socket.emit("document", documents[docId]);
  });
});

server.listen(port, () => {
  console.log(`started on port: ${port}`);
});
