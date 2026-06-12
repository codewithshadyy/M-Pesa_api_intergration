

const { Timestamp } = require("mongodb")
const mongoose =require("mongoose")

const transactionSchema = mongoose.Schema({


    merchantRequestID: { type: String },
    checkoutRequestID: { type: String, unique: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    accountReference: { type: String },
    description: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "TIMEOUT"],
      default: "PENDING",
    },


    mpesaReceiptNumber: { type: String },       
    transactionDate: { type: String },           
    resultCode: { type: Number },
    resultDesc: { type: String },


    callbackPayload: { type: mongoose.Schema.Types.Mixed },


}, {timestamps:true})


module.exports = mongoose.model("Transaction", transactionSchema)