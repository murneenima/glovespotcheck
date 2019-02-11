const mongoose = require('mongoose')
var Schema = mongoose.Schema

// =================== STD Value ====================
var StdProductTypeSchema = new Schema({
    std_producttype:{
        type:String,
        required:true,
        unique:true
    }
})

var StdProductType = mongoose.model('StdProductType',StdProductTypeSchema)
module.exports = StdProductType