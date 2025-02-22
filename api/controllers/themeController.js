const opensearchClient = require('../config/opensearch');
const INDEX_NAME = 'themes';

// Get all themes
exports.getAllThemes = async (req, res) => {
  try {
    const response = await opensearchClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {}
        },
      }
    });

    const themes = response.body.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ message: 'Error fetching themes' });
  }
};

// Get theme by ID
exports.getThemeById = async (req, res) => {
  try {
    const response = await opensearchClient.get({
      index: INDEX_NAME,
      id: req.params.id
    });

    if (!response.body.found) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const theme = {
      id: response.body._id,
      ...response.body._source
    };

    res.json(theme);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    console.error('Error fetching theme:', error);
    res.status(500).json({ message: 'Error fetching theme' });
  }
};

// Create new theme
exports.createTheme = async (req, res) => {
  try {
    const { name, colors, fonts, spacing } = req.body;
    
    const response = await opensearchClient.index({
      index: INDEX_NAME,
      body: {
        name,
        colors,
        fonts,
        spacing,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      refresh: true
    });

    const newTheme = {
      id: response.body._id,
      name,
      colors,
      fonts,
      spacing,
      is_active: false
    };

    res.status(201).json(newTheme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ message: 'Error creating theme' });
  }
};

// Update theme
exports.updateTheme = async (req, res) => {
  try {
    const { name, colors, fonts, spacing, is_active } = req.body;
    
    // If setting this theme as active, deactivate all other themes
    if (is_active) {
      await opensearchClient.updateByQuery({
        index: INDEX_NAME,
        body: {
          query: {
            match_all: {}
          },
          script: {
            source: 'ctx._source.is_active = false'
          }
        },
        refresh: true
      });
    }

    const response = await opensearchClient.update({
      index: INDEX_NAME,
      id: req.params.id,
      body: {
        doc: {
          name,
          colors,
          fonts,
          spacing,
          is_active,
          updated_at: new Date().toISOString()
        }
      },
      refresh: true
    });

    const updatedTheme = {
      id: req.params.id,
      name,
      colors,
      fonts,
      spacing,
      is_active
    };

    res.json(updatedTheme);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Error updating theme' });
  }
};

// Delete theme
exports.deleteTheme = async (req, res) => {
  try {
    // Check if theme is active
    const theme = await opensearchClient.get({
      index: INDEX_NAME,
      id: req.params.id
    });

    if (theme.body._source.is_active) {
      return res.status(400).json({ 
        message: 'Cannot delete active theme. Please activate another theme first.' 
      });
    }

    await opensearchClient.delete({
      index: INDEX_NAME,
      id: req.params.id,
      refresh: true
    });

    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    console.error('Error deleting theme:', error);
    res.status(500).json({ message: 'Error deleting theme' });
  }
}; 