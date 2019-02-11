const mongoose = require('mongoose')
var Schema = mongoose.Schema 

// ================= Staff Schedule =============
var CurrentSchema = new Schema({
    current_day:{
        type:String,
      //  required:true
       
    },
    c_badgeNo:{
        type:String,
        required:true,
     //   unique:true
    },
    c_name:{
        type:String,
     //   required:true
    },
    c_surname:{
        type:String,
      //  required:true
    },
    c_position:{
        type:String,
     //   required:true
    },
    c_department:{  
        type:String,
     //   required:true
    },
    c_status:{
        type:String,
        default: "N/A"
    },
    c_date:{ // วันที่
        type:String,
     //   required:true
    },
    c_month:{
        type:String,
    //    required:true
    },
    c_year:{
        type:String,
    //    required:true
    }
})

var Current = mongoose.model('Current',CurrentSchema)
module.exports = Current