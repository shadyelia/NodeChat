const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "ChatDb";
const client = new MongoClient(url);
var ObjectID = require("mongodb").ObjectID;

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
    if (socket.user) usersOnline[socket.user.userName].selectedUser = data.to;
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
    if (socket.user) {
      db.collection("Users", function(err, collection) {
        collection
          .aggregate([
            {
              $lookup: {
                from: "Messages",
                localField: "userName",
                foreignField: "from",
                as: "messages"
              }
            }
          ])
          .toArray(function(err, items) {
            if (err) throw err;
            this.users = items;
            this.users.forEach(user => {
              user.numberOfNewMessages = user.messages.filter(
                message =>
                  message.to == socket.user.userName &&
                  message.isReaded == false
              ).length;
            });
            io.emit("usersList", this.users);
          });
      });
    }
  }

  function addUser(user) {
    db.collection("Users", function(err, collection) {
      collection.insertOne(
        {
          userName: user.userName,
          token: user.token,
          isOnline: true
        },
        function(error, response) {
          if (error) {
            console.log("error ocuured while inserting document");
          } else {
            socket.user = response.ops[0];
            usersOnline[user.userName] = socket;
            getUsers();
          }
        }
      );
    });

    // var query = { userName: user.userName };
    // db.collection("Users")
    //   .find(query)
    //   .toArray(function(err, result) {
    //     if (err) throw err;
    //     socket.user = result[0];
    //     usersOnline[user.userName] = socket;
    //   });

    // getUsers();
  }

  function makeUserOffline(id) {
    db.collection("Users", function(err, collection) {
      collection.updateOne(
        { _id: ObjectID(id) },
        { $set: { isOnline: false } },
        function(err, result) {
          if (err) throw err;
          console.log("User Online offline");
          delete usersOnline[socket.user.userName];
          getUsers();
        }
      );
    });
  }

  function makeUserOnline(id) {
    db.collection("Users", function(err, collection) {
      collection.updateOne(
        { _id: ObjectID(id) },
        { $set: { isOnline: true } },
        function(err, result) {
          if (err) throw err;
          console.log("User Online now");
          usersOnline[socket.user.userName] = socket;
          getUsers();
        }
      );
    });
  }

  function getOldMessages(from, to) {
    var queryFrom = { from: from, to: to };
    var queryTo = { from: to, to: from };
    db.collection("Messages")
      .find({ $or: [queryFrom, queryTo] })
      .sort({ creationTime: 1 })
      .toArray(function(err, messages) {
        if (err) throw err;
        if (usersOnline[from])
          usersOnline[from].emit("gotUserOldMessages", messages);
        if (usersOnline[to])
          usersOnline[to].emit("makeMessagesReaded", messages);
      });

    updateMessagesToReaded(queryTo);
  }

  function updateMessagesToReaded(queryTo) {
    var data = { $set: { isReaded: true } };
    db.collection("Messages").updateMany(queryTo, data, (err, collection) => {
      if (err) throw err;
      console.log(
        collection.result.nModified + " Record(s) updated successfully"
      );
    });
  }

  function addMessage(message) {
    if (
      usersOnline[message.to] &&
      usersOnline[message.to].selectedUser == message.from
    )
      message.isReaded = true;
    db.collection("Messages", function(err, collection) {
      collection.insertOne({
        message: message.message,
        creationTime: message.creationTime,
        from: message.from,
        to: message.to,
        isReaded: message.isReaded,
        type: message.type,
        fileName: message.fileName
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
