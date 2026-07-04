const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { getMe, getAllUsers, getUserCount, adminGetAllDetails } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.get('/count', getUserCount);
router.get('/', getAllUsers);

// Endpoint admin-only
router.get('/admin/details', adminOnly, adminGetAllDetails);

module.exports = router;