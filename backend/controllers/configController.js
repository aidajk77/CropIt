const Configuration = require('../models/Configuration');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


// create configuration function
const createConfig = async (req, res, next) => {
  try {
    const { scaleDown, logoPosition, description } = req.body;
    
    if (scaleDown && (isNaN(scaleDown) || parseFloat(scaleDown) > 0.25)) {
      return res.status(400).json({ error: 'scaleDown must be a number <= 0.25' });
    }

    const configData = {
      scaleDown: scaleDown ? parseFloat(scaleDown) : null,
      logoPosition: logoPosition || 'bottom-right',
      description,
      logoData: req.file ? req.file.buffer : null,  // Store binary data
      logoMimeType: req.file ? req.file.mimetype : null,
      logoFileSize: req.file ? req.file.size : null
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
    
    // Validate scaleDown parameter
    if (scaleDown && (isNaN(scaleDown) || parseFloat(scaleDown) > 0.25)) {
      return res.status(400).json({ error: 'scaleDown must be a number <= 0.25' });
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

    const config = await Configuration.update(id, updateData);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
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

// Get configuration by ID
const getConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const config = await Configuration.findById(id);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
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

// Get all configurations
const getAllConfigs = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const configs = await Configuration.findAll(
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