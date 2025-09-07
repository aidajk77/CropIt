const sharp = require('sharp');
const Configuration = require('../models/Configuration');
const fs = require('fs');
const path = require('path');

// Helper function to process crop coordinates
const processCropCoordinates = (coords) => {
  if (Array.isArray(coords) && coords.length >= 4) {
    return {
      left: Math.round(coords[0]),
      top: Math.round(coords[1]),
      width: Math.round(coords[2]),
      height: Math.round(coords[3])
    };
  }
  throw new Error('Invalid crop coordinates. Expected [x, y, width, height]');
};

// Helper function to apply logo overlay
const applyLogoOverlay = async (imageBuffer, config) => {
  if (!config || !config.logoFilePath) {
    return imageBuffer;
  }

  try {
    // Read logo file from disk
    const logoPath = path.join(__dirname, '..', config.logoFilePath);
    
    // Check if logo file exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found:', logoPath);
      return imageBuffer;
    }
    
    const logoBuffer = fs.readFileSync(logoPath);
    
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();
    
    // Scale logo if scaleDown parameter is provided
    let logoImage = sharp(logoBuffer);
    if (config.scaleDown && config.scaleDown < 1) {
      const logoMeta = await logoImage.metadata();
      logoImage = logoImage.resize(
        Math.round(logoMeta.width * config.scaleDown),
        Math.round(logoMeta.height * config.scaleDown)
      );
    }

    // Position logo based on logoPosition
    let left = 0;
    let top = 0;
    
    const logoMeta = await logoImage.metadata();
    
    switch (config.logoPosition?.toLowerCase()) {
      case 'top-right':
        left = width - logoMeta.width - 10;
        top = 10;
        break;
      case 'bottom-left':
        left = 10;
        top = height - logoMeta.height - 10;
        break;
      case 'bottom-right':
        left = width - logoMeta.width - 10;
        top = height - logoMeta.height - 10;
        break;
      case 'center':
        left = Math.round((width - logoMeta.width) / 2);
        top = Math.round((height - logoMeta.height) / 2);
        break;
      default: // top-left
        left = 10;
        top = 10;
    }

    const result = await image
      .composite([{ 
        input: await logoImage.toBuffer(), 
        left: Math.max(0, left), 
        top: Math.max(0, top) 
      }])
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Error applying logo overlay:', error);
    return imageBuffer; // Return original image if logo overlay fails
  }
};

// Generate image preview (scaled down to 5%)
const generatePreview = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { cropCoords } = req.body;
    if (!cropCoords) {
      return res.status(400).json({ error: 'Crop coordinates are required' });
    }

    let coords;
    try {
      coords = typeof cropCoords === 'string' ? JSON.parse(cropCoords) : cropCoords;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid crop coordinates format' });
    }

    const cropParams = processCropCoordinates(coords);
    
    // Crop and scale down to 5% of original size
    const processedImage = await sharp(req.file.buffer)
      .extract(cropParams)
      .resize(Math.round(cropParams.width * 0.05), Math.round(cropParams.height * 0.05))
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(processedImage);
  } catch (error) {
    console.error('Preview error:', error);
    next(error);
  }
};

// Generate full-quality cropped image with optional logo overlay
const generateCroppedImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { cropCoords, configId } = req.body;
    if (!cropCoords) {
      return res.status(400).json({ error: 'Crop coordinates are required' });
    }

    let coords;
    try {
      coords = typeof cropCoords === 'string' ? JSON.parse(cropCoords) : cropCoords;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid crop coordinates format' });
    }

    const cropParams = processCropCoordinates(coords);
    
    // Crop image (high quality, no scaling)
    let processedImage = await sharp(req.file.buffer)
      .extract(cropParams)
      .png()
      .toBuffer();

    // Apply logo overlay if configId is provided
    if (configId) {
      try {
        const config = await Configuration.findById(configId);
        if (config) {
          processedImage = await applyLogoOverlay(processedImage, config);
        }
      } catch (configError) {
        console.error('Config lookup error:', configError);
        // Continue without logo overlay
      }
    }

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'attachment; filename="cropped-image.png"');
    res.send(processedImage);
  } catch (error) {
    console.error('Generate error:', error);
    next(error);
  }
};

module.exports = {
  generatePreview,
  generateCroppedImage
};