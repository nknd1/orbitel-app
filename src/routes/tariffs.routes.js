const {Router} = require('express');
const controller = require('../controllers/tariffs.controller')
const cors = require("cors");
const router = Router();

router.get("/", cors(),controller.getTariffs);
router.get("/:tariff_id", cors(),controller.getTariffById);
router.post("/", cors(),controller.addTariff);
router.put("/:tariff_id", cors(),controller.updateTariff);
router.delete("/:tariff_id", cors(),controller.removeTariff);
module.exports = router;


