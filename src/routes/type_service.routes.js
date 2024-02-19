const {Router} = require('express');
const controller = require('../controllers/type_service.controller')
const router = Router();

router.get("/", controller.getServiceType);
router.get("/:id", controller.getServiceTypeById);
router.post("/", controller.addServiceType);
router.put("/:id", controller.updateServiceType);
router.delete("/:id", controller.removeServiceType);
module.exports = router;


