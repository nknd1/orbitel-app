const {Router} = require('express');
const controller = require('../controllers/contracts.controller')
const cors = require("cors");
const router = Router();
const { verifyToken, protectedRoute } = require('../middleware/authMiddleware'); // Подключение промежуточного ПО

router.get("/", cors(),controller.getContracts);
router.post("/", cors(),controller.addContract);
router.post("/login", cors(), controller.loginContract)
router.get("protected-route", cors(), verifyToken, protectedRoute);
router.post("/refresh-token", cors(), controller.refreshToken);
router.get("/:contract_id", cors(),controller.getContractsById);
router.put("/:contract_id", cors(),controller.updateContract);
router.delete("/:contract_id", cors(),controller.removeContract);
module.exports = router;



