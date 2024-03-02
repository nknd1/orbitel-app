const {Router} = require('express');
const controller = require('../controllers/client.controller')
const router = Router();

router.get("/", controller.getClients);
router.get("/:client_id", controller.getClientById);
router.post("/", controller.addClient);
router.post("/register", controller.registerClient);
router.post("/login", controller.loginClient);
router.put("/:client_id", controller.updateClient);
router.delete("/:client_id", controller.removeClient);
module.exports = router;


