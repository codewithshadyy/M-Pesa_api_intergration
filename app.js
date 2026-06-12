const express = require("express")
const app = express()
const connectDB = require("./config/db")

const dotenv = require("dotenv")
dotenv.config()

// database connection
connectDB()






app.listen(process.env.PORT, ()=>{
    console.log(`App runnign on:http://localhost:${process.env.PORT}`)
})