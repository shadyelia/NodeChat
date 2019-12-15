const Users = require('./models/user.model')

var usersOnline = {};

function login(socket, user) {
    var query = { userName: user.userName };
    var options = { upsert: true, useFindAndModify: false }
    return new Promise((resolve, reject) => {
        Users.findOneAndUpdate(query, { $set: { 'isOnline': true } }, options, (error, doc, res) => {
            if (error) { reject("error : " + error.message) }
            else {
                socket.user = user
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
                        as: "sender"
                    }
                }, {
                    $project: {
                        "userName": 1,
                        "isOnline": 1,
                        "token": 1,
                        "numberOfNewMessages": {
                            $size: {
                                $filter: {
                                    input: "$sender",
                                    as: "notReaddedMessage",
                                    cond: { $eq: ['$$notReaddedMessage.isReaded', true] }
                                }
                            }
                        }
                    }
                }
            ], (error, result) => {
                if (error) { reject("error : " + error.message) }
                else {
                    resolve(result);
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