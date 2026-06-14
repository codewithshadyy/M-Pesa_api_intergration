const express = require("express")
const app = express()
const connectDB = require("./config/db")
const check = require("./healthCheck/check")
const mpesaRoutes = require("./routes/mpesa")
const accountRoutes = require("./routes/accounts")

const dotenv = require("dotenv")
dotenv.config()

app.use(express.json())

// database connection
connectDB()

//health check
app.use("", check)
app.use("/api/mpesa", mpesaRoutes)
app.use("/api/accounts", accountRoutes)






app.listen(process.env.PORT, ()=>{
    console.log(`App runnign on:http://localhost:${process.env.PORT}`)
})