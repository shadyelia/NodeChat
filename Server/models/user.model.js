const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    userName: { type: String, required: true },
    isOnline: { type: Boolean, default: true },
    token: { type: String, default: Math.random().toString() }
})

module.exports = mongoose.model('Users', UserSchema);