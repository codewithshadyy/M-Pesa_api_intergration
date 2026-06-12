

const express = require("express")
const Transaction = require("../models/Transaction")
const {initiateStkPush, queryStkStatus} = require("../services/mpesa")


require("dotenv").config()

 exports.makePayment = async (req,res) => {

    try {


        let {phone, amount, accountReference, description} = req.body


        if(!phone || !amount){
            return res.status(400).json({

                   error: "phone and amount are required" 
                
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


      const stkResponse =  initiateStkPush(
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

            console.error("STK Push error:", error.response?.data || error.message);
       return res.status(500).json({
            success:false,
            details:error.response?.data || error.message
        })
    }
    
}



exports.callback = async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
 
    if (!callbackData) {
      console.warn(" Invalid callback payload received");
      return res.status(400).json({ error: "Invalid callback" });
    }
 
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callbackData;
 
    console.log(` Callback received | ResultCode: ${ResultCode} | ${ResultDesc}`);
 
    
    const transaction = await Transaction.findOne({
      checkoutRequestID: CheckoutRequestID,
    });
 
    if (!transaction) {
      console.warn(` Transaction not found: ${CheckoutRequestID}`);
      
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
 
    
    if (ResultCode === 0) {
      
      const metadata = {};
      CallbackMetadata?.Item?.forEach((item) => {
        if (item.Value !== undefined) metadata[item.Name] = item.Value;
      });
 
      transaction.status = "SUCCESS";
      transaction.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
      transaction.transactionDate = String(metadata.TransactionDate);
      transaction.resultCode = ResultCode;
      transaction.resultDesc = ResultDesc;
      transaction.callbackPayload = callbackData;
 
      console.log(`Payment SUCCESS | Receipt: ${metadata.MpesaReceiptNumber} | Amount: ${metadata.Amount}`);
    } else {
      
      transaction.status = ResultCode === 1032 ? "CANCELLED" : "FAILED";
      transaction.resultCode = ResultCode;
      transaction.resultDesc = ResultDesc;
      transaction.callbackPayload = callbackData;
 
      console.log(`Payment FAILED | Code: ${ResultCode} | ${ResultDesc}`);
    }
 
    await transaction.save();
 
    
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Callback processing error:", error.message);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}



exports.checkStatus = async (req,res) => {




          try {
    const { checkoutRequestID } = req.params;
 
    
    const transaction = await Transaction.findOne({ checkoutRequestID });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
 
    
    if (transaction.status !== "PENDING") {
      return res.json({
        status: transaction.status,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        amount: transaction.amount,
        phone: transaction.phone,
        resultDesc: transaction.resultDesc,
      });
    }
 
    
    const darajaStatus = await queryStkStatus(checkoutRequestID);
 
    return res.json({
      status: "PENDING",
      darajaResultCode: darajaStatus.ResultCode,
      darajaResultDesc: darajaStatus.ResultDesc,
    });

        
    } catch (error) {
         console.error("Status check error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Could not fetch status" });
    }
    
    }


    exports.getTransactions = async (req, res) => {

        const transaction = await Transaction.find().sort({createdAt:-1}).limit(10)
        return res.status(200).json({
            success:true,
            data:transaction
        })
        
    }