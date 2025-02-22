const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

// GET user by ID
router.get('/:id', userController.getUserById);

// POST create new user
router.post('/', userController.createUser);

// PUT update user
router.put('/:id', userController.updateUser);

// DELETE user
router.delete('/:id', userController.deleteUser);

module.exports = router; 