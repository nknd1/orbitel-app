const {Router} = require('express');
const controller = require('../controllers/users.controller')
const router = Router();

router.get('/',  controller.getUsers);
router.get('/:user_id', controller.getUserById);
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
module.exports = router;
