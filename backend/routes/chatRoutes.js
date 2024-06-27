const express = require('express');
const {accessChat, fetchChat, createGroupChat, renameGroupChat, addToGroup, removeFromGroup, deleteChat} = require('../controllers/chatControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChat);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroupChat);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/groupadd').put(protect, addToGroup);
// router.route('/adminadd').put(protect, addAdmin);

module.exports = router;