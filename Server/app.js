const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

users = [];

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

io.sockets.on("connection", socket => {
  socket.on("new-user", function(data, exists) {
    if (users.indexOf(data) != -1) {
      console.log("user exist before", data);
      exists(true);
    } else {
      console.log("new user login", data);
      exists(false);
      socket.user = data;
      users.push(data);
      updateUsers();
    }
  });

  socket.on("send-message", message => {
    io.emit("new-message", message);
  });

  socket.on("disconnection", socket => {
    if (!socket.user) return;
    users.splice(usrs.indexOf(socket.user), 1);
    updateUsers();
  });

  function updateUsers() {
    io.emit("usernames", users);
  }
});
