

const express = require("express")
const router = express.Router()
const {makePayment, callback, checkStatus} = require("../controllers/mpesa")
router.post("/pay", makePayment)
router.post("/callback", callback)
router.get("/status/:checkoutRequestID",  checkStatus)


module.exports = router


