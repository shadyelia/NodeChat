const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "ChatDb";
const client = new MongoClient(url);
var db;

users = [];

// Connect to the db
function ConnectToDB() {
  client.connect(function(err, client) {
    db = client.db(dbName);
    console.log("Connected correctly to server");

    getUsers();
  });
}

io.sockets.on("connection", socket => {
  ConnectToDB();
  socket.on("login", function(data, finish) {
    login(data);
    finish(true);
    updateUsers();
  });

  socket.on("send-message", message => {
    io.emit("new-message", message);
  });

  socket.on("disconnection", socket => {
    if (!socket.user) return;
    makeUserOffline(socket.user.id);
    updateUsers();
  });

  function updateUsers() {
    getUsers();
    io.emit("usernames", users);
  }
});

function makeUserOffline(id) {
  db.collection("Users", function(err, collection) {
    collection.update({ id: id }, { $set: { isOnline: false } }, function(
      err,
      result
    ) {
      if (err) throw err;
      console.log("Document Updated Successfully");
    });
  });
}

function makeUserOnline(id) {
  db.collection("Users", function(err, collection) {
    collection.update({ id: id }, { $set: { isOnline: false } }, function(
      err,
      result
    ) {
      if (err) throw err;
      console.log("Document Updated Successfully");
    });
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

function login(user) {
  var query = { userName: user.userName };
  db.collection("Users")
    .find(query)
    .toArray(function(err, result) {
      if (err) throw err;
      if (result && result.length != 0) {
        makeUserOnline(result[0].id);
      } else {
        addUser(user);
      }
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
}

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
