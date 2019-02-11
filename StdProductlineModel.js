const mongoose = require('mongoose')
var Schema = mongoose.Schema

var StdProductlineSchema = new Schema({
    std_productline:{
        type:String,
        required:true,
        unique:true
    }
})

var StdProductline = mongoose.model('StdProductline',StdProductlineSchema)
module.exports = StdProductline