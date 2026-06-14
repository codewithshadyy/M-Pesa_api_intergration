
const jwt = require("jsonwebtoken")

exports.protect = async (req,res, next) => {


    let token
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1]



             try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        

        req.user = decoded
        return decoded

        next()
        
        
    } catch (error) {

        return res.status(401).json({
            success:false,
            message:"Unathorized access"
        })
    }
        }else{

            return res.status(401).json({
                success:false,
                message:"No token provided"
            })

        }

   
    
    
    
}

