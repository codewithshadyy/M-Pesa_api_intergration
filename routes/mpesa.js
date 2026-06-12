

const express = require("express")
const router = express.Router()
const {makePayment, callback} = require("../controllers/mpesa")
router.post("/pay", makePayment)
router.post("/callback", callback)


module.exports = router


