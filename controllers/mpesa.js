

const express = require("express")
const Transaction = require("../models/Transaction")
const {initiateStkPUsh, queryStkStatus} = require("../services/mpesa")

require("dotenv").config()

 exports.makePayment = async (req,res) => {

    try {


        let {phone, amount, accountReference, description} = req.body


        if(!phone || !amount){
            return res.status(400).json({
                
            })
        }

        phone = phone.toString().replace(/^(\+254|0)/, "254")

        if(!/^2547\d{8}$/.test(phone)){
            return res.status(400).json({
                success:false,
                Message:"Invalid format:use format 0708663597 0r 254708663597"
            })
        }

        if (amount < 1) {
      return res.status(400).json({ error: "Amount must be at least KES 1" });
    }


    accountReference = accountReference || "ORDER001";
    description = description || "Payment";


      const stkResponse = await initiateStkPush(
      phone,
      amount,
      accountReference,
      description
    );

     if (stkResponse.ResponseCode !== "0") {
      return res.status(502).json({
        error: "Failed to initiate payment",
        details: stkResponse,
      });
    }

     const transaction = await Transaction.create({
      merchantRequestID: stkResponse.MerchantRequestID,
      checkoutRequestID: stkResponse.CheckoutRequestID,
      phone,
      amount,
      accountReference,
      description,
      status: "PENDING",
    });

     return res.status(200).json({
      message: "STK Push sent. Ask customer to enter PIN.",
      checkoutRequestID: stkResponse.CheckoutRequestID,
      transactionId: transaction._id,
    });

        
    } catch (error) {
       return res.status(500).json({
            success:false,
            details:error.response?.data || error.message
        })
    }
    
}