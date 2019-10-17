const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "ChatDb";
const client = new MongoClient(url);
var db;

var users = [];

io.sockets.on("connection", socket => {
  ConnectToDB();

  socket.on("login", function(data, finish) {
    finish(true);
    login(data);
    updateUsers();
  });

  socket.on("send-message", message => {
    if (!socket.user) return;
    message.userName = socket.user.userName;
    io.emit("new-message", message);
  });

  socket.on("disconnect", function() {
    if (!socket.user) return;
    console.log(socket.user.userName + "going offline");
    makeUserOffline(socket.user.id);
    updateUsers();
  });

  function updateUsers() {
    getUsers();
    io.emit("usersList", this.users);
  }

  function login(user) {
    var query = { userName: user.userName };
    db.collection("Users")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        if (result && result.length != 0) {
          console.log(socket.user.userName + "going online");
          makeUserOnline(result[0].id);
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
      });
    });
  }

  function addUser(user) {
    db.collection("Users", function(err, collection) {
      collection.insert({
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
      });
  }

  function makeUserOffline(id) {
    db.collection("Users", function(err, collection) {
      collection.update({ id: id }, { $set: { isOnline: false } }, function(
        err,
        result
      ) {
        if (err) throw err;
        updateUsers();
      });
    });
  }

  function makeUserOnline(id) {
    db.collection("Users", function(err, collection) {
      collection.update({ id: id }, { $set: { isOnline: true } }, function(
        err,
        result
      ) {
        if (err) throw err;
        console.log("User Online now");
        updateUsers();
      });
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
