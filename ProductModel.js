const mongoose = require('mongoose')
var Schema = mongoose.Schema

// ========== Product =============
var ProductSchema = new Schema ({
    product_id:{
        type:String,
        required:true,
        unique:true
    },
    product_name:{
        type:String,
        required:true
    },
    product_type:{
        type:String,
        required:true
    },
    product_size:{
        type:String,
        required:true
    },
    weight_min:{
        type:String,
        required:true
    },
    weight_max:{
        type:String,
        required:true
    },
    length_min:{
        type:String,
        required:true
    },
    length_max:{
        type:String,
        required:true
    }
})

var Product = mongoose.model('Product',ProductSchema)
module.exports = Product