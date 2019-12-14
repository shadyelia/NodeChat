const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    message: { type: String, required: true },
    creationTime: { type: Date, required: true },
    from: { type: String, require: true },
    to: { type: String, require: true },
    messageType: { type: Number },
    isReaded: { type: Boolean },
    fileName: { type: String },
    type: { type: Number }
});


module.exports = mongoose.model('Messages', MessageSchema);