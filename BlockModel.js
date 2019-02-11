const mongoose = require('mongoose')
var Schema = mongoose.Schema

// ================== Block Schema =================
var BlockSchema = new Schema({
    blockName:{
        type:String,
       // required:true,
     
    },
    productLine:{
        type:String,
        unique:true
      //  required:true
     
    },
    badgeNo:{
        type:String,
        default:'N/A'
    }
})

var Block = mongoose.model('Block',BlockSchema)
module.exports = Block