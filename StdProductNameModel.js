const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StdProductNameSchema = new Schema({
    std_productname:{
        type:String,
        required:true,
        unique:true
    }
})

var StdProductName = mongoose.model('StdProductName',StdProductNameSchema)
module.exports = StdProductName