const Users = require('./models/user.model')

var usersOnline = {};
var users;

function login(socket, user) {
    var query = { userName: user.userName };
    var options = { upsert: true, useFindAndModify: false }
    return new Promise((resolve, reject) => {
        Users.findOneAndUpdate(query, { $set: { 'isOnline': true } }, options, (error, doc, res) => {
            if (error) { reject("error : " + error.message) }
            else {
                socket.user = doc
                usersOnline[user.userName] = socket
                console.log(user.userName + " is online")
                resolve();
            }
        })
    })
}

function getUsers(socket) {
    return new Promise((resolve, reject) => {
        if (socket.user) {
            Users.aggregate([
                {
                    $lookup: {
                        from: "Messages",
                        localField: "userName",
                        foreignField: "from",
                        as: "messages"
                    }
                },
            ], function (error, result) {
                if (error) { reject("error : " + error.message) }
                else {
                    this.users = result;
                    this.users.forEach(user => {
                        user.numberOfNewMessages = user.messages.filter(
                            message =>
                                message.to == socket.user.userName &&
                                message.isReaded == false
                        ).length;
                    });
                    resolve(this.users);
                }
            })
        }
    })
}

function makeUserOffline(id) {
    return new Promise((resolve, reject) => {
        Users.updateOne(
            { _id: id },
            { $set: { isOnline: false } },
            (err, result) => {
                if (err) reject(err)
                else {
                    console.log(result.userName + " is offline ..");
                    delete usersOnline[result.userName];
                    resolve();
                }
            }
        );
    });
}

module.exports = { login, getUsers, makeUserOffline, usersOnline }