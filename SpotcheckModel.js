const mongoose = require('mongoose')
var Schema = mongoose.Schema

//=================================
var SpotcheckSchema = new Schema({
    spot_badge:{
        type:String,
        required:true
    },
    spot_name:{
        type:String,
        required:true
    },
    spot_surname:{
        type:String,
        required:true
    },
    spot_time:{
        type:String,
        required:true
    },
    spot_date:{
        type:String,
        required:true
    },
    spot_day:{
        type:String,
        required:true
    },
    spot_month:{
        type:String,
        required:true
    },
    spot_year:{
        type:String,
        required:true
    },
    spot_block:{
        type:String,
        required:true
    },
    spot_productline:{
        type:String,
        required:true
    },
    spot_productname:{
        type:String,
        required:true
    },
    spot_producttype:{
        type:String,
        required:true
    },
    spot_size:{
        type:String,
        required:true
    },
    spot_length:{
        type:String,
        required:true
    },
    spot_weight:{
        type:String,
        required:true
    },
    spot_linespeed:{
        type:String,
        required:true
    }
})

var Spotcheck = mongoose.model('Spotcheck',SpotcheckSchema)
module.exports = Spotcheck