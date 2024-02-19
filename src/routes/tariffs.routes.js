const {Router} = require('express');
const controller = require('../controllers/tariffs.controller')
const router = Router();

router.get("/", controller.getTariffs);
router.get("/:tariff_id", controller.getTariffById);
router.post("/", controller.addTariff);
router.put("/:tariff_id", controller.updateTariff);
router.delete("/:service_id", controller.removeTariff);
module.exports = router;


