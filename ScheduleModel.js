const mongoose = require('mongoose')
var Schema = mongoose.Schema 

// ================= Staff Schedule =============
var ScheduleSchema = new Schema({
    day:{
        type:String,
        //required:true,

    },
    s_badgeNo:{
        type:String,
       // required:true,
        unique:true
    },
    s_name:{
        type:String,
       // required:true
    },
    s_surname:{
        type:String,
       // required:true
    },
    s_position:{
        type:String,
        //required:true
    },
    s_department:{
        type:String,
       // required:true
    },
    s_status:{
        type:String,
        default: "N/A"
    },
    s_day:{ // วันที่
        type:String,
        default: "N/A"
    },
    s_month:{
        type:String,
        default: "N/A"
    },
    s_year:{
        type:String,
        default: "N/A"
    },
    s_linespotcheck:{
        type:String,
        default: "N/A"
    }
})

var Schedule = mongoose.model('Schedule',ScheduleSchema)
module.exports = Schedule