const expresss= require("express")
const router = expresss.Router()
const {Register} = require("../controllers/accountControllers")


router.post("/register", Register)



module.exports = router