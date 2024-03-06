const {Router} = require('express');
const controller = require('../controllers/client.controller')
const router = Router();
const cors = require('cors');

router.get("/", cors(), controller.getClients);
router.get("/:client_id", cors(),controller.getClientById);
router.post("/", cors(),controller.addClient);
router.post("/register", cors(),controller.registerClient);
router.post("/login", cors(),controller.loginClient);
router.put("/:client_id", cors(),controller.updateClient);
router.delete("/:client_id", cors(),controller.removeClient);
module.exports = router;


