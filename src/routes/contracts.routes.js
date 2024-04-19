const {Router} = require('express');
const controller = require('../controllers/contracts.controller')
const cors = require("cors");
const router = Router();


router.get("/", cors(),controller.getContracts);
router.get("/:contract_id", cors(), controller.getContractInfo);
router.post("/", cors(),controller.addContract);
router.get("/:contract_id", cors(),controller.getContractsById);
router.put("/:contract_id", cors(),controller.updateContract);
router.delete("/:contract_id", cors(),controller.removeContract);



module.exports = router;



