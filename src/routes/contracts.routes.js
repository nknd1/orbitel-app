const {Router} = require('express');
const controller = require('../controllers/contracts.controller')
const router = Router();


router.get("/", controller.getContracts);
router.post("/", controller.addContract);
router.get("/:contract_id", controller.getContractsById);
router.put("/:contract_id", controller.updateContract);
router.delete("/:contract_id", controller.removeContract);
module.exports = router;



