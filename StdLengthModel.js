const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StdLengthSchema = new Schema({
    std_length:{
        type:String,
        required:true,
        unique:true
    }
})

var StdLength = mongoose.model('StdLength',StdLengthSchema)
module.exports = StdLength