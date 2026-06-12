
const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()


async function connectDB() {

    mongoose.connect(process.env.MONGODB_URL)
    .then(()=> console.log("Database connected successfully"))
    .catch(err => {
        console.log(`Error connecting to the database:${err}`)
    })
    
}

module.exports = connectDB