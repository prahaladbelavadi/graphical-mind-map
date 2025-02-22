const opensearchClient = require('../config/opensearch');
const INDICES = {
  users: 'users',
  conversations: 'conversations',
  themes: 'themes'
};

async function initializeOpenSearch() {
  try {
    // Initialize users index
    const usersExists = await opensearchClient.indices.exists({
      index: INDICES.users
    });

    if (!usersExists.body) {
      await opensearchClient.indices.create({
        index: INDICES.users,
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              email: { type: 'keyword' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('Users index created successfully');
    }

    // Initialize conversations index
    const conversationsExists = await opensearchClient.indices.exists({
      index: INDICES.conversations
    });

    if (!conversationsExists.body) {
      await opensearchClient.indices.create({
        index: INDICES.conversations,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              participants: { type: 'keyword' },
              messages: {
                type: 'nested',
                properties: {
                  content: { type: 'text' },
                  sender_id: { type: 'keyword' },
                  timestamp: { type: 'date' }
                }
              },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('Conversations index created successfully');
    }

    // Initialize themes index
    const themesExists = await opensearchClient.indices.exists({
      index: INDICES.themes
    });

    if (!themesExists.body) {
      await opensearchClient.indices.create({
        index: INDICES.themes,
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              colors: {
                properties: {
                  primary: { type: 'keyword' },
                  secondary: { type: 'keyword' },
                  background: { type: 'keyword' },
                  text: { type: 'keyword' }
                }
              },
              fonts: {
                properties: {
                  primary: { type: 'keyword' },
                  secondary: { type: 'keyword' },
                  sizes: {
                    properties: {
                      small: { type: 'integer' },
                      medium: { type: 'integer' },
                      large: { type: 'integer' }
                    }
                  }
                }
              },
              spacing: {
                properties: {
                  small: { type: 'integer' },
                  medium: { type: 'integer' },
                  large: { type: 'integer' }
                }
              },
              is_active: { type: 'boolean' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('Themes index created successfully');
    }

    console.log('OpenSearch initialization completed');
  } catch (error) {
    console.error('Error initializing OpenSearch:', error);
    process.exit(1);
  }
}

initializeOpenSearch(); 