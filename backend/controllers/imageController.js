const sharp = require('sharp');
const Configuration = require('../models/Configuration');

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

const applyLogoOverlay = async (imageBuffer, config) => {
  if (!config || !config.logoData) {
    return imageBuffer;
  }

  try {
    const logoBuffer = Buffer.from(config.logoData);
    
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();
    
    let logoImage = sharp(logoBuffer);
    const logoMeta = await logoImage.metadata();
    
    // Calculate logo size with better scaling for small images
    let logoWidth = logoMeta.width;
    let logoHeight = logoMeta.height;
    
    if (config.scaleDown && config.scaleDown < 1) {
      logoWidth = Math.round(logoMeta.width * config.scaleDown);
      logoHeight = Math.round(logoMeta.height * config.scaleDown);
    }
    
    // Force logo to maximum 30% of image size
    const maxWidth = Math.floor(width * 0.3);
    const maxHeight = Math.floor(height * 0.3);
    
    if (logoWidth > maxWidth || logoHeight > maxHeight) {
      const scaleRatio = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
      logoWidth = Math.max(1, Math.round(logoWidth * scaleRatio));
      logoHeight = Math.max(1, Math.round(logoHeight * scaleRatio));
    }
    
    logoImage = logoImage.resize(logoWidth, logoHeight);
    
    // Position calculation remains the same
    let left = 10;
    let top = 10;
    
    switch (config.logoPosition?.toLowerCase()) {
      case 'top-right':
        left = Math.max(0, width - logoWidth - 10);
        break;
      case 'bottom-left':
        top = Math.max(0, height - logoHeight - 10);
        break;
      case 'bottom-right':
        left = Math.max(0, width - logoWidth - 10);
        top = Math.max(0, height - logoHeight - 10);
        break;
      case 'center':
        left = Math.max(0, Math.round((width - logoWidth) / 2));
        top = Math.max(0, Math.round((height - logoHeight) / 2));
        break;
    }

    const result = await image
      .composite([{ 
        input: await logoImage.toBuffer(), 
        left: left, 
        top: top 
      }])
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Error applying logo overlay:', error);
    return imageBuffer;
  }
};

// Generate image preview (scaled down to 5%) with optional logo overlay
const generatePreview = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const { cropCoords, configId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!cropCoords) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop coordinates are required' 
      });
    }

    let coords;
    try {
      coords = typeof cropCoords === 'string' ? JSON.parse(cropCoords) : cropCoords;
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid crop coordinates format' 
      });
    }

    const cropParams = processCropCoordinates(coords);
    
    // First crop at full size
    let processedImage = await sharp(req.file.buffer)
      .extract(cropParams)
      .png()
      .toBuffer();

    // Apply logo overlay at full size if configId is provided
    if (configId) {
      try {
        // Use user-specific config lookup to ensure security
        const config = await Configuration.findByIdAndUser(configId, userId);
        if (!config) {
          return res.status(404).json({
            success: false,
            error: 'Configuration not found or access denied'
          });
        }
        
        processedImage = await applyLogoOverlay(processedImage, config);
      } catch (configError) {
        console.error('Config lookup error in preview:', configError);
        return res.status(500).json({
          success: false,
          error: 'Failed to apply configuration'
        });
      }
    }

    // Then scale down to 5% for preview
    const finalPreview = await sharp(processedImage)
      .resize(Math.round(cropParams.width * 0.05), Math.round(cropParams.height * 0.05))
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(finalPreview);
  } catch (error) {
    console.error('Preview error:', error);
    next(error);
  }
};

// Generate full-quality cropped image with optional logo overlay
const generateCroppedImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const { cropCoords, configId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!cropCoords) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop coordinates are required' 
      });
    }

    let coords;
    try {
      coords = typeof cropCoords === 'string' ? JSON.parse(cropCoords) : cropCoords;
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid crop coordinates format' 
      });
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
        // Use user-specific config lookup to ensure security
        const config = await Configuration.findByIdAndUser(configId, userId);
        if (!config) {
          return res.status(404).json({
            success: false,
            error: 'Configuration not found or access denied'
          });
        }
        
        processedImage = await applyLogoOverlay(processedImage, config);
      } catch (configError) {
        console.error('Config lookup error:', configError);
        return res.status(500).json({
          success: false,
          error: 'Failed to apply configuration'
        });
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