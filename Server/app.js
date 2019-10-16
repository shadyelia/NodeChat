const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
var MongoClient = require("mongodb").MongoClient;

users = [];

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

io.sockets.on("connection", socket => {
  ConnectToDB();
  socket.on("new-user", function(data, exists) {
    if (users.indexOf(data) != -1) {
      console.log("user exist before", data);
      exists(false);
    } else {
      console.log("new user login", data);
      exists(false);
      socket.user = data;
      addUser(data);
      updateUsers();
    }
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

var db;
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "ChatDb";

// Create a new MongoClient
const client = new MongoClient(url);

// Connect to the db
function ConnectToDB() {
  client.connect(function(err, client) {
    // assert.equal(null, err);
    console.log("Connected correctly to server");

    db = client.db(dbName);
  });
}

// console.log("connected to mongo");
// MongoClient.connect("mongodb://", function(err, db) {
//   if (err) throw err;

//   db = client.db(dbName);

// function makeUserOffline(id) {
//   db.collection("Users", function(err, collection) {
//     collection.update({ id: id }, { $set: { isOnline: false } }, function(
//       err,
//       result
//     ) {
//       if (err) throw err;
//       console.log("Document Updated Successfully");
//     });
//   });
// }

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
}
