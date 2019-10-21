const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "ChatDb";
const client = new MongoClient(url);
var db;

var users = [];
var usersOnline = {};

io.sockets.on("connection", socket => {
  ConnectToDB();

  socket.on("login", function(data, finish) {
    finish(true);
    login(data);
  });

  socket.on("sendMessage", message => {
    addMessage(message);
  });

  socket.on("disconnect", function() {
    if (!socket.user) return;
    console.log(socket.user.userName + " is going offline");
    makeUserOffline(socket.user._id);
    getUsers();
  });

  socket.on("getOldMessages", data => {
    getOldMessages(data.from, data.to);
  });

  function login(user) {
    var query = { userName: user.userName };
    db.collection("Users")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        if (result && result.length != 0) {
          console.log(result[0].userName + " is going online");
          makeUserOnline(result[0]._id);
          socket.user = result[0];
        } else {
          addUser(user);
        }
      });
  }

  function getUsers() {
    db.collection("Users", function(err, collection) {
      collection.find().toArray(function(err, items) {
        if (err) throw err;
        this.users = items;
        io.emit("usersList", this.users);
      });
    });
  }

  function addUser(user) {
    db.collection("Users", function(err, collection) {
      collection.insertOne({
        userName: user.userName,
        token: user.token,
        isOnline: true
      });
    });

    var query = { userName: user.userName };
    db.collection("Users")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        socket.user = result[0];
        usersOnline[user.userName] = socket;
      });

    getUsers();
  }

  function makeUserOffline(id) {
    db.collection("Users", function(err, collection) {
      collection.update({ _id: id }, { $set: { isOnline: false } }, function(
        err,
        result
      ) {
        if (err) throw err;
        console.log("User Online offline");
        getUsers();
      });
    });
  }

  function makeUserOnline(id) {
    db.collection("Users", function(err, collection) {
      collection.update({ _id: id }, { $set: { isOnline: true } }, function(
        err,
        result
      ) {
        if (err) throw err;
        console.log("User Online now");
        usersOnline[socket.user.userName] = socket;
        getUsers();
      });
    });
  }

  function getOldMessages(from, to) {
    var query = { from: from, to: to };
    db.collection("Messages")
      .find(query)
      .sort({ creationTime: 1 })
      .toArray(function(err, result) {
        if (err) throw err;
        socket.emit("gotUserOldMessages", result);
      });
  }

  function addMessage(message) {
    db.collection("Messages", function(err, collection) {
      collection.insertOne({
        message: message.message,
        creationTime: message.creationTime,
        from: message.from,
        to: message.to
      });
      if (usersOnline[message.from])
        usersOnline[message.from].emit("newMessage", message);
      if (usersOnline[message.to])
        usersOnline[message.to].emit("newMessage", message);
    });
  }
});

// Connect to the db
function ConnectToDB() {
  client.connect(function(err, client) {
    db = client.db(dbName);
    console.log("Connected correctly to server");
  });
}

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
