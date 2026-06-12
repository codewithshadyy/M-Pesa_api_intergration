
const express = require("express")
const app = express()



app.get("/", (req, res)=>{
   return res.json({
        "Status":"M-pesa API running "
    })
})

module.exports = app