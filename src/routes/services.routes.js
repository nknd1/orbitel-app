const {Router} = require('express');
const controller = require('../controllers/services.controller')
const router = Router();
const cors = require('cors');
router.get("/", cors(), controller.getServices);
router.get("/:service_id", cors(), controller.getServiceById);
router.post("/", cors(), controller.addService);
router.put("/:service_id", cors(), controller.updateService);
router.delete("/:service_id", cors(), controller.removeService);
module.exports = router;


