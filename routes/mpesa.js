

const express = require("express")
const router = express.Router()
const {makePayment, callback, checkStatus, getTransactions} = require("../controllers/mpesa")
router.post("/pay", makePayment)
router.post("/callback", callback)
router.get("/status/:checkoutRequestID",  checkStatus)
router.get("/transactions", getTransactions)


module.exports = router


