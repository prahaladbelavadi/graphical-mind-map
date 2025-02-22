const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

// GET all themes
router.get('/', themeController.getAllThemes);

// GET theme by ID
router.get('/:id', themeController.getThemeById);

// POST create new theme
router.post('/', themeController.createTheme);

// PUT update theme
router.put('/:id', themeController.updateTheme);

// DELETE theme
router.delete('/:id', themeController.deleteTheme);

module.exports = router; 