const Messages = require('./models/message.model')

const { usersOnline } = require('./users.js')

function getOldMessages(from, to) {
    var queryFrom = { from: from, to: to };
    var queryTo = { from: to, to: from };
    Messages.find({ $or: [queryFrom, queryTo] })
        .sort({ creationTime: 1 })
        .toArray(function (err, messages) {
            if (err) console.log(err)
            return messages;
        });

    updateMessagesToReaded(queryTo);
}

function updateMessagesToReaded(queryTo) {
    var data = { $set: { isReaded: true } };
    Messages.updateMany(queryTo, data, (err, collection) => {
        if (err) console.log(err);
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
    Messages.insertOne({
        message: message.message,
        creationTime: message.creationTime,
        from: message.from,
        to: message.to,
        isReaded: message.isReaded,
        type: message.type,
        fileName: message.fileName
    });
    return message;
}

module.exports = { getOldMessages, addMessage }