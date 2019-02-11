const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StdSizeSchema = new Schema({
    std_size:{
        type:String,
        required:true,
        unique:true
    }
})

var StdSize = mongoose.model('StdSize',StdSizeSchema)
module.exports = StdSize