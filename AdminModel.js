const mongoose = require('mongoose')
var Schema = mongoose.Schema

// ======================= Admin Schema ===========
var AdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    }
})

var Admin = mongoose.model('Admin', AdminSchema)
module.exports = Admin