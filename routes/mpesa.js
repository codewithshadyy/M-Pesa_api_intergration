

const express = require("express")
const router = express.Router()
const {makePayment, callback, checkStatus, getTransactions} = require("../controllers/mpesa")
const{protect} = require("../middlewares/protect")


router.post("/pay",protect, makePayment)
router.post("/callback", callback)
router.get("/status/:checkoutRequestID",  checkStatus)
router.get("/transactions",protect, getTransactions)


module.exports = router


