require('./database/mongo')
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);


const { login, getUsers, makeUserOffline, usersOnline } = require('./users.js');
const { getOldMessages, addMessage } = require('./messages.js');

io.sockets.on("connection", socket => {
  socket.on("login", async function (data, callback) {
    callback(true);

    await login(socket, data);
    var allUsers = await getUsers(socket);
    io.emit("usersList", allUsers)
  });

  socket.on("sendMessage", message => {
    usersOnline[message.from].emit("newMessage", message);

    var messageFromDB = addMessage(message);

    if (usersOnline[message.from])
      usersOnline[message.from].emit("newMessage", messageFromDB);
    if (usersOnline[message.to])
      usersOnline[message.to].emit("newMessage", messageFromDB);
  });

  socket.on("disconnect", function () {
    if (!socket.user) return;
    console.log(socket.user.userName + " is going offline");
    makeUserOffline(socket, socket.user._id);
    var users = getUsers(socket);
    io.emit("usersList", users);
  });

  socket.on("getOldMessages", data => {
    if (socket.user) usersOnline[socket.user.userName].selectedUser = data.to;

    oldMessages = getOldMessages(data.from, data.to);

    if (usersOnline[from])
      usersOnline[from].emit("gotUserOldMessages", oldMessages);
    if (usersOnline[to])
      usersOnline[to].emit("makeMessagesReaded", oldMessages);
  });

});



server.listen(3000, () => {
  console.log("Listening on port 3000");
});
