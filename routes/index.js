var express = require('express');
var router = express.Router();
let Controller = require('../controllers/user.controller.js');
let validateLogin = require('../middleware/validate.login.js');
let handleError = require('../middleware/validate.error.js')

/* GET home page. */
router.get('/dang-nhap',handleError, Controller.login);
router.post('/dang-ky', handleError, Controller.handleRegister);
router.get('/dang-ky', handleError, Controller.register);
router.post('/', Controller.handleLogin);
router.use(validateLogin);
router.get('/', Controller.index);
router.post('/dang-xuat', Controller.handleLogout);
router.post('/edit', Controller.edit)
router.post('/update', Controller.update)

module.exports = router;
