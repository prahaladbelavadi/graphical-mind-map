const opensearchClient = require('../config/opensearch');
const INDEX_NAME = 'users';

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const response = await opensearchClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {}
        }
      }
    });

    const users = response.body.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const response = await opensearchClient.get({
      index: INDEX_NAME,
      id: req.params.id
    });

    if (!response.body.found) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = {
      id: response.body._id,
      ...response.body._source
    };

    res.json(user);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const response = await opensearchClient.index({
      index: INDEX_NAME,
      body: {
        name,
        email,
        created_at: new Date().toISOString()
      },
      refresh: true
    });

    const newUser = {
      id: response.body._id,
      name,
      email
    };

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const response = await opensearchClient.update({
      index: INDEX_NAME,
      id: req.params.id,
      body: {
        doc: {
          name,
          email,
          updated_at: new Date().toISOString()
        }
      },
      refresh: true
    });

    const updatedUser = {
      id: req.params.id,
      name,
      email
    };

    res.json(updatedUser);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const response = await opensearchClient.delete({
      index: INDEX_NAME,
      id: req.params.id,
      refresh: true
    });

    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 