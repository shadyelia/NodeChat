const Users = require('./models/user.model')

var usersOnline = {};

function login(socket, user) {
    var query = { userName: user.userName };
    var options = { upsert: true, useFindAndModify: false }
    return new Promise((resolve, reject) => {
        Users.findOneAndUpdate(query, { $set: { 'isOnline': true } }, options, function (error, doc, res) {
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
            ], function (error, result) {
                if (error) { reject("error : " + error.message) }
                else {
                    resolve(result);
                }
            })
        }
    })
}

function makeUserOffline(socket, id) {
    Users.updateOne(
        { _id: ObjectID(id) },
        { $set: { isOnline: false } },
        function (err, result) {
            if (err) console.log(err)
            console.log(result.userName + " is offline");
            delete usersOnline[socket.user.userName];
            getUsers();
        }
    );

}

module.exports = { login, getUsers, makeUserOffline, usersOnline }