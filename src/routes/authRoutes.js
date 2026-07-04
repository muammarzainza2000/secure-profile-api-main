const express = require('express');
const { register, login, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/authValidator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Endpoint ganti password — butuh token
router.post('/change-password', protect, changePasswordValidator, changePassword);

module.exports = router;