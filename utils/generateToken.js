
const jwt = require("jsonwebtoken")
const person = require("../models/Account")

require("dotenv").config()
exports.generateToken =  async (user) => {

    return jwt.sign(
        {
            user:user._id,
            role:user.role
        },

        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    )

    
}