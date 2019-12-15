const Messages = require('./models/message.model')

const { usersOnline } = require('./users.js')

function getOldMessages(from, to) {
    var queryFrom = { from: from, to: to };
    var queryTo = { from: to, to: from };
    return new Promise((resolve, reject) => {
        Messages.find({ $or: [queryFrom, queryTo] })
            .sort({ creationTime: 1 })
            .exec((err, messages) => {
                if (err) reject(err)
                resolve(messages);
            });
    });
}

function updateMessagesToReaded(from, to) {
    var queryTo = { from: to, to: from };
    var data = { $set: { isReaded: true } };
    return new Promise((resolve, reject) => {
        Messages.updateMany(queryTo, data, (err, collection) => {
            if (err) reject(err);
            else {
                if (collection.result)
                    console.log(
                        collection.result.nModified + " Record(s) updated successfully"
                    );
                resolve();
            }

        });
    });
}

function addMessage(message) {
    if (
        usersOnline[message.to] &&
        usersOnline[message.to].selectedUser == message.from
    )
        message.isReaded = true;
    var incommingMessage = new Messages(message)
    return new Promise((resolve, reject) => {
        incommingMessage.save(function (err, doc) {
            resolve(message);
        })
    });

}

module.exports = { getOldMessages, updateMessagesToReaded, addMessage }