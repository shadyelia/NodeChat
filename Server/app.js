const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

server.listen(3000, () => {
  console.log("Listening on port 4444");
});
