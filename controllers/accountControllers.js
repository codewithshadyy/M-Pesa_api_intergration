
const Person = require("../models/Account")
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/generateToken")
const account = require("../models/Account")


exports.register = async (req,res) => {

    try {

        const {username, email, password} = req.body
        const personExists = await Person.findOne({
            $or:[{username}, {email}]
        })

        if(personExists){
            return res.status(500).json({
                success:false,
                message:"OOp! try another email or password"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const person = await Person.create({
            username,
            email,
            password:hashedPassword
        })

        const token = await generateToken(person)

        return res.status(201).json({
            success:true,
            message:`${person.username} creatde successfully`,

            data:{
                id:person._id,
                username:person.username,
                email:person.email,
                token:token
        }
        })
        
    } catch (error) {

        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
    
}

exports.login = async (req,res) => {

    try {

        const{username, password} = req.body
        const user = await Person.findOne({username})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"Invalid credenntials"
            })
        }

        passwordMatch = bcrypt.compare(password,user.password)

        const token = await generateToken(user)
        return res.status(200).json({
            success:true,
            message:`welcome back ${user.username}!!!!`,
            data:{
                token,
                id:user._id,
                username:user.username
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
    
}