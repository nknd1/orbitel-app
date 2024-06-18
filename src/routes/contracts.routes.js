const {Router} = require('express');
const controller = require('../controllers/contracts.controller')
const cors = require("cors");
const authenticateToken = require("../middlewares/authMiddleware");
const router = Router();


router.get("/", cors(),controller.getContracts);





module.exports = router;



