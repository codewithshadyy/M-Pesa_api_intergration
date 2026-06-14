
const jwt = require("jsonwebtoken")
const person = require("../models/Person")

require("dotenv").config()
exports.generateToken =  async (user) => {

    return jwt.sign(
        {
            user:req._id,
            role:req.user.role
        },

        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    )

    
}