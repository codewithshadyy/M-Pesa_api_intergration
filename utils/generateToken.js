
const jwt = require("jsonwebtoken")
const person = require("../models/Account")

require("dotenv").config()
exports.generateToken =  async (user) => {

    return jwt.sign(
        {
            id:user._id,
            role:user.role
        },

        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    )

    
}