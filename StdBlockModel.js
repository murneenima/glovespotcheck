const mongoose = require('mongoose')
var Schema = mongoose.Schema


// =================================================
var StdBlockSchema = new Schema({
    std_block:{
        type:String,
        required:true,
        unique:true
    }
})

var StdBlock = mongoose.model('StdBlock',StdBlockSchema)
module.exports = StdBlock