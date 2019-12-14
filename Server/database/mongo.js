var mongoose = require('mongoose');
var ConnectionString = 'mongodb://localhost:27017/ChatDb';

mongoose.connect(ConnectionString, { useNewUrlParser: true, useFindAndModify: false });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected correctly to server");
});



module.exports = db