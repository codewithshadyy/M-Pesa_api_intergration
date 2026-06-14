
const mongoose = require("mongoose")


const personSchema =  mongoose.Schema({
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


const person = mongoose.model("Person", personSchema)

module.exports = person