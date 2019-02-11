const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StdWeightSchema = new Schema({
    std_weight:{
        type:String,
        required:true,
        unique:true
    }
})

var StdWeight = mongoose.model('StdWeight',StdWeightSchema)
module.exports = StdWeight