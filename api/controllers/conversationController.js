const opensearchClient = require('../config/opensearch');
const INDEX_NAME = 'conversations';

// Get all conversations
exports.getAllConversations = async (req, res) => {
  try {
    const response = await opensearchClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {}
        },
        sort: [
          { created_at: { order: 'desc' }}
        ]
      }
    });

    const conversations = response.body.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

// Get conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const response = await opensearchClient.get({
      index: INDEX_NAME,
      id: req.params.id
    });

    if (!response.body.found) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = {
      id: response.body._id,
      ...response.body._source
    };

    res.json(conversation);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const { title, participants } = req.body;
    
    const response = await opensearchClient.index({
      index: INDEX_NAME,
      body: {
        title,
        participants,
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      refresh: true
    });

    const newConversation = {
      id: response.body._id,
      title,
      participants,
      messages: []
    };

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Error creating conversation' });
  }
};

// Update conversation
exports.updateConversation = async (req, res) => {
  try {
    const { title, participants } = req.body;
    
    const response = await opensearchClient.update({
      index: INDEX_NAME,
      id: req.params.id,
      body: {
        doc: {
          title,
          participants,
          updated_at: new Date().toISOString()
        }
      },
      refresh: true
    });

    const updatedConversation = {
      id: req.params.id,
      title,
      participants
    };

    res.json(updatedConversation);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Error updating conversation' });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    await opensearchClient.delete({
      index: INDEX_NAME,
      id: req.params.id,
      refresh: true
    });

    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Error deleting conversation' });
  }
};

// Add message to conversation
exports.addMessage = async (req, res) => {
  try {
    const { content, sender_id } = req.body;
    
    const message = {
      content,
      sender_id,
      timestamp: new Date().toISOString()
    };

    const response = await opensearchClient.update({
      index: INDEX_NAME,
      id: req.params.id,
      body: {
        script: {
          source: 'ctx._source.messages.add(params.message); ctx._source.updated_at = params.updated_at',
          lang: 'painless',
          params: {
            message: message,
            updated_at: new Date().toISOString()
          }
        }
      },
      refresh: true
    });

    res.status(201).json(message);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Error adding message to conversation' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const response = await opensearchClient.get({
      index: INDEX_NAME,
      id: req.params.id,
      _source_includes: ['messages']
    });

    if (!response.body.found) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(response.body._source.messages || []);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
}; 