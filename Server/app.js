require('./database/mongo')
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);


const { login, getUsers, makeUserOffline, usersOnline } = require('./users.js');
const { getOldMessages, updateMessagesToReaded, addMessage } = require('./messages.js');

io.sockets.on("connection", socket => {
  socket.on("login", async (data, callback) => {
    callback(true);

    await login(socket, data);
    var allUsers = await getUsers(socket);
    io.emit("usersList", allUsers)
  });

  socket.on("sendMessage", async message => {
    var messageFromDB = await addMessage(message).catch((err) => {
      console.error(err);
    });

    if (usersOnline[message.from])
      usersOnline[message.from].emit("newMessage", messageFromDB);
    if (usersOnline[message.to])
      usersOnline[message.to].emit("newMessage", messageFromDB);
  });

  socket.on("disconnect", async () => {
    if (!socket.user) return;
    console.log(socket.user.userName + " is going offline");
    await makeUserOffline(socket.user.id);
    var users = await getUsers(socket);
    io.emit("usersList", users);
  });

  socket.on("getOldMessages", async data => {
    if (socket.user) usersOnline[socket.user.userName].selectedUser = data.to;

    oldMessages = await getOldMessages(data.from, data.to);
    await updateMessagesToReaded(data.from, data.to);

    if (usersOnline[data.from])
      usersOnline[data.from].emit("gotUserOldMessages", oldMessages);
    if (usersOnline[data.to])
      usersOnline[data.to].emit("makeMessagesReaded", oldMessages);
  });

});



server.listen(3000, () => {
  console.log("Listening on port 3000");
});
