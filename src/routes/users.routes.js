const {Router} = require('express');
const controller = require('../controllers/users.controller')
const cors = require("cors");

const router = Router();

router.get('/',  cors(),controller.getUsers);
router.get('/:user_id', cors(), controller.getUserById);
router.post('/register', cors(),controller.registerUser);
router.post('/login', cors(),controller.loginUser);
module.exports = router;
