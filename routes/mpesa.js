

const express = require("express")
const router = express.Router()
const {makePayment} = require("../controllers/mpesa")
router.post("/pay", makePayment)


module.exports = router


