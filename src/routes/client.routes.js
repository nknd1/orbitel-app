const {Router} = require('express');
const controller = require('../controllers/client.controller')
const router = Router();
const cors = require('cors');
const authenticateToken = require("../middlewares/authMiddleware");

router.get('/contracts/:contract_id/operations', authenticateToken, controller.getOperationHistory);

router.get('/contract-details', authenticateToken, controller.getContractDetails);

router.post('/tariff', authenticateToken, controller.connectTariffToContract);

router.get('/contract', authenticateToken, controller.getContractInfo);

router.post('/balance', authenticateToken, controller.upBalanceInContract);

router.post('/contracts/:contract_id/services/:service_id', authenticateToken, controller.addServiceToContract);

router.put('/contracts/:contract_id/change-tariff/:tariff_id', authenticateToken, controller.changeTariff);

router.delete('/contracts/:contract_id/services/:service_id', authenticateToken, controller.removeServiceFromContract);

router.put('/contracts/add-balance', authenticateToken, controller.addBalance);

router.get("/", cors(), controller.getClients);

router.post("/", cors(),controller.addClient);

router.get('/info', authenticateToken, controller.getClientInfo);

router.post("/login", cors(),controller.loginClient);

//router.get("/:client_id", cors(),controller.getClientById);
//router.put("/:client_id", cors(),controller.updateClient);
//router.delete("/:client_id", cors(),controller.removeClient);

module.exports = router;


