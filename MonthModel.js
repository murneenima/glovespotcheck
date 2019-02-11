const mongoose = require('mongoose')
var Schema = mongoose.Schema

var MonthSchema = new Schema({
    m_day:{
        type:String,
        //required:true,

    },
    m_badgeNo:{
        type:String,
       // required:true,
        unique:true
    },
    m_name:{
        type:String,
       // required:true
    },
    m_surname:{
        type:String,
       // required:true
    },
    m_position:{
        type:String,
        //required:true
    },
    m_department:{
        type:String,
       // required:true
    },
    m_status:{
        type:String,
        default: "N/A"
    },
    m_date:{ // วันที่
        type:String,
        default: "N/A"
    },
    m_month:{
        type:String,
        default: "N/A"
    },
    m_year:{
        type:String,
        default: "N/A"
    },
    m_linespotcheck:{
        type:String,
        default: "N/A"
    }
})

var Month = mongoose.model('Month',MonthSchema)
module.exports = Month