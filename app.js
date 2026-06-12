const express = require("express")
const app = express()
const connectDB = require("./config/db")
const check = require("./healthCheck/check")

const dotenv = require("dotenv")
dotenv.config()

app.use(express.json())

// database connection
connectDB()

//health check
app.use("", check)






app.listen(process.env.PORT, ()=>{
    console.log(`App runnign on:http://localhost:${process.env.PORT}`)
})