const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// GET all conversations
router.get('/', conversationController.getAllConversations);

// GET conversation by ID
router.get('/:id', conversationController.getConversationById);

// POST create new conversation
router.post('/', conversationController.createConversation);

// PUT update conversation
router.put('/:id', conversationController.updateConversation);

// DELETE conversation
router.delete('/:id', conversationController.deleteConversation);

// POST add message to conversation
router.post('/:id/messages', conversationController.addMessage);

// GET messages for a conversation
router.get('/:id/messages', conversationController.getMessages);

module.exports = router; 