const {Router} = require('express');
const controller = require('../controllers/type_service.controller')
const cors = require("cors");
const router = Router();

router.get("/", cors(),controller.getServiceType);
router.get("/:id", cors(),controller.getServiceTypeById);
router.post("/", cors(),controller.addServiceType);
router.put("/:id", cors(),controller.updateServiceType);
router.delete("/:id", cors(),controller.removeServiceType);
module.exports = router;


