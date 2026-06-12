
const dotenv = require("dotenv")
const axios = require("axios")
const Transaction = require("../models/Transaction")
dotenv.config()


 async function getAccessToken () {

    const auth = Buffer.from(
        `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
    ).toString("base64")

    const res = await axios.get(
         `${process.env.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,

         {headers:{
            Authorization:`Basic ${auth}`
        }})
    return res.data.access_token
}

function generatePassword (){
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

 async function initiateStkPush (phone, amount, accountRef, description)  {


    const token = await getAccessToken()
    const {password, timestamp}= generatePassword()

    const payload = {
        BusinessShortCode: process.env.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType:"CustomerPayBillOnline",
        Amount:Math.round(amount),
        PartyA:phone,
        PartyB:process.env.SHORTCODE,
        PhoneNumber:phone,
        CallBackURL:process.env.CALLBACK_URL,
        AccountReference:accountRef.substring(0,12),
        TransactionDesc:description.substring(0,13)

 
    }


    const response = await axios.post(
        `${process.env.BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
            headers:{
                Authorization: `Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    )

    return response.data
    
}

 async function queryStkStatus (checkoutRequestID){

    const token = await getAccessToken()
    const {password, timestamp} = generatePassword()

    const response = await axios.fetch(
        `${process.env.BASE_URL}/mpesa/stkpushqueryStatus/v1/query`,
        {
            BusinessShortCode: process.env.SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID,
            
        },
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"

            }
        }
    )
return response.data

}

module.exports ={getAccessToken, initiateStkPush, queryStkStatus}