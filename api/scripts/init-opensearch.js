const opensearchClient = require('../config/opensearch');
const INDEX_NAME = 'users';

async function initializeOpenSearch() {
  try {
    const indexExists = await opensearchClient.indices.exists({
      index: INDEX_NAME
    });

    if (!indexExists.body) {
      await opensearchClient.indices.create({
        index: INDEX_NAME,
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
    } else {
      console.log('Users index already exists');
    }
  } catch (error) {
    console.error('Error initializing OpenSearch:', error);
    process.exit(1);
  }
}

initializeOpenSearch(); 