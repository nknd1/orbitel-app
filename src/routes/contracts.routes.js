const {Router} = require('express');
const controller = require('../controllers/contracts.controller')
const cors = require("cors");
const authenticateToken = require("../middlewares/authMiddleware");
const router = Router();


router.get("/", cors(),controller.getContracts);
router.post("/service", cors(), controller.addServiceToTariff);
router.post("/login", cors(), controller.login);
router.get('/contract-info', authenticateToken, controller.getContractAndClientInfo);
router.post('/top-up', cors(), controller.topUpContractBalance);
router.get("/writeoff", cors(),controller.getWriteoffs);
router.get("/deposit", cors(), controller.getDeposits);
router.get("/:contract_id", cors(), controller.getContractInfo);
router.post("/", cors(),controller.addContract);
router.get("/:contract_id", cors(),controller.getContractsById);
router.put("/:contract_id", cors(),controller.updateContract);
router.delete("/:contract_id", cors(),controller.removeContract);



module.exports = router;



