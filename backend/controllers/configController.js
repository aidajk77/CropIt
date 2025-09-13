const Configuration = require('../models/Configuration');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// create configuration function
const createConfig = async (req, res, next) => {
  try {
    const { scaleDown, logoPosition, description } = req.body;
    const userId = req.userId; // From Clerk middleware
    
    if (scaleDown && (isNaN(scaleDown) || parseFloat(scaleDown) > 0.25)) {
      return res.status(400).json({ error: 'scaleDown must be a number <= 0.25' });
    }

    const configData = {
      userId: userId, 
      scaleDown: scaleDown ? parseFloat(scaleDown) : null,
      logoPosition: logoPosition || 'bottom-right',
      description,
      logoData: req.file ? req.file.buffer : null,
      logoMimeType: req.file ? req.file.mimetype : null,
    };

    const config = await Configuration.create(configData);
    
    res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: config.toJSON()
    });
  } catch (error) {
    console.error('Config creation error:', error);
    next(error);
  }
};

// Update existing configuration
const updateConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scaleDown, logoPosition, description } = req.body;
    const userId = req.userId; // From Clerk middleware
    
    // Validate scaleDown parameter
    if (scaleDown && (isNaN(scaleDown) || parseFloat(scaleDown) > 0.25)) {
      return res.status(400).json({ error: 'scaleDown must be a number <= 0.25' });
    }

    // First check if config exists and belongs to user
    const existingConfig = await Configuration.findByIdAndUser(id, userId);
    if (!existingConfig) {
      return res.status(404).json({ 
        success: false, 
        error: 'Configuration not found or access denied' 
      });
    }

    const updateData = {};
    
    // Update fields only if provided
    if (scaleDown !== undefined) updateData.scaleDown = parseFloat(scaleDown);
    if (logoPosition !== undefined) updateData.logoPosition = logoPosition;
    if (description !== undefined) updateData.description = description;
    
    // Handle logo image update 
    if (req.file) {
      updateData.logoData = req.file.buffer;        
      updateData.logoMimeType = req.file.mimetype;  
      updateData.logoFileName = req.file.originalname;
      updateData.logoFileSize = req.file.size;
    }

    const config = await Configuration.updateByUser(id, userId, updateData);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config.toJSON()
    });
  } catch (error) {
    console.error('Config update error:', error);
    next(error);
  }
};

// Get configuration by ID (user-owned only)
const getConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From Clerk middleware
    
    const config = await Configuration.findByIdAndUser(id, userId);
    
    if (!config) {
      return res.status(404).json({ 
        success: false, 
        error: 'Configuration not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: config.toJSON()
    });
  } catch (error) {
    console.error('Config retrieval error:', error);
    next(error);
  }
};

// Get all configurations for authenticated user
const getAllConfigs = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.userId; // From Clerk middleware
    
    const configs = await Configuration.findAllByUser(
      userId,
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      count: configs.length,
      data: configs.map(config => config.toJSON())
    });
  } catch (error) {
    console.error('Config list error:', error);
    next(error);
  }
};

module.exports = {
  createConfig,
  updateConfig,
  getConfig,
  getAllConfigs
};