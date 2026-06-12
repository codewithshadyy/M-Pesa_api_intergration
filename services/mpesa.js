
const dotenv = require("dotenv")
const axios = require("axios")
dotenv.config()


exports.getAccessToken = async () => {

    const auth = Buffer.from(
        `${process.env.CONSUMER_KEY}:{process.env.CONSUMER_SECRET}`
    ).toString("base64")

    const res = await axios.fetch(
         'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',

         {Headers:{
            Authorization:`Basic ${auth}`
        }}

        
    )
    return res.data.access_token
}

exports.generatePassword = ()=>{
    const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g,'')
    .slice(0,14)

    const raw = `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`

    return{
        password:Buffer.from(raw).toString('base64'),
        timestamp
}
}