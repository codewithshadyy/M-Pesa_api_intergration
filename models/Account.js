
const mongoose = require("mongoose")


const accountSchema =  mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true
    },

    email:{
        type:String,
        unique:true
    },

    password:{
        type:String
    },

    role:{
        type:String,
        enum:["buyer", "admin", "seller"],
        default:"buyer"
    }
}, {timestamps:true})


const account = mongoose.model("Account", accountSchema)

module.exports = account