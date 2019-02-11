const mongoose = require('mongoose')
var Schema = mongoose.Schema

// ====================== Staff Schema ===================
var StaffSchema = new Schema ({
    badgeNo:{
        type:String,
        required:true,
        unique:true,
        minlength:7
    },
    emp_password:{
        type:String,
        required:true
    },
    emp_name:{
        type:String,
        required:true
    },
    emp_surname:{
        type:String,
        required:true
    },
    emp_position:{
        type:String,
        required:true
    },
    emp_dept:{
        type:String,
        required:true
    }
})

var Staff = mongoose.model('Staff',StaffSchema)
module.exports = Staff