const { createConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Configuration {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id; // Add user ID
    this.scaleDown = data.scale_down;
    this.logoPosition = data.logo_position;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.description = data.description;
    this.logoData = data.logo_data;
    this.logoMimeType = data.logo_mime_type;
  }

  // Create new configuration with user association
  static async create(configData) {
    const db = createConnection();
    const id = uuidv4();
    
    const query = `
      INSERT INTO configurations (
        id, user_id, scale_down, logo_position, description, logo_data, logo_mime_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      configData.userId, // Include user ID
      parseFloat(configData.scaleDown) || null,
      configData.logoPosition || 'bottom-right',
      configData.description || null,
      configData.logoData || null,
      configData.logoMimeType || null,
    ];

    try {
      await db.execute(query, params);
      return await Configuration.findById(id);
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw new Error('Failed to create configuration');
    }
  }

  // Find configuration by ID (keeping original method for backward compatibility)
  static async findById(id) {
    const db = createConnection();
    const query = 'SELECT * FROM configurations WHERE id = ? AND is_active = 1';
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0] ? new Configuration(rows[0]) : null;
    } catch (error) {
      console.error('Error finding configuration:', error);
      throw new Error('Failed to find configuration');
    }
  }

  // NEW: Find configuration by ID and user ID (user-specific)
  static async findByIdAndUser(id, userId) {
    const db = createConnection();
    const query = 'SELECT * FROM configurations WHERE id = ? AND user_id = ? AND is_active = 1';
    
    try {
      const [rows] = await db.execute(query, [id, userId]);
      return rows[0] ? new Configuration(rows[0]) : null;
    } catch (error) {
      console.error('Error finding user configuration:', error);
      throw new Error('Failed to find configuration');
    }
  }

  // Find all active configurations (keeping original method)
  static async findAll(limit = 50, offset = 0) {
    const db = createConnection();

    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;

    const query = `
      SELECT * FROM configurations 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      const [rows] = await db.execute(query, [limitInt, offsetInt]);
      return rows.map(row => new Configuration(row));
    } catch (error) {
      console.error('Error finding configurations:', error);
      throw new Error('Failed to retrieve configurations');
    }
  }

  // NEW: Find all configurations for a specific user
  static async findAllByUser(userId, limit = 50, offset = 0) {
    const db = createConnection();

    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;

    const query = `
      SELECT * FROM configurations 
      WHERE user_id = ? AND is_active = 1 
      ORDER BY created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows.map(row => new Configuration(row));
    } catch (error) {
      console.error('Error finding user configurations:', error);
      throw new Error('Failed to retrieve user configurations');
    }
  }

  // Update existing configuration (keeping original method)
  static async update(id, updateData) {
    const db = createConnection();
    const fields = [];
    const params = [];

    // Build dynamic update query
    if (updateData.scaleDown !== undefined) {
      fields.push('scale_down = ?');
      params.push(updateData.scaleDown);
    }
    if (updateData.logoPosition !== undefined) {
      fields.push('logo_position = ?');
      params.push(updateData.logoPosition);
    }
    if (updateData.logoData !== undefined) {
      fields.push('logo_data = ?');
      params.push(updateData.logoData);
    }
    if (updateData.logoMimeType !== undefined) {
      fields.push('logo_mime_type = ?');
      params.push(updateData.logoMimeType);
    }
    if (updateData.logoFileName !== undefined) {
      fields.push('logo_file_name = ?');
      params.push(updateData.logoFileName);
    }
    if (updateData.logoFileSize !== undefined) {
      fields.push('logo_file_size = ?');
      params.push(updateData.logoFileSize);
    }
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      params.push(updateData.description);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at timestamp and WHERE clause
    fields.push('updated_at = NOW()');
    params.push(id);

    const query = `
      UPDATE configurations 
      SET ${fields.join(', ')} 
      WHERE id = ? AND is_active = 1
    `;

    try {
      const [result] = await db.execute(query, params);
      if (result.affectedRows === 0) {
        return null; // Configuration not found
      }
      return await Configuration.findById(id);
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw new Error('Failed to update configuration');
    }
  }

  // NEW: Update configuration for specific user (user-specific)
  static async updateByUser(id, userId, updateData) {
    const db = createConnection();
    const fields = [];
    const params = [];

    // Build dynamic update query
    if (updateData.scaleDown !== undefined) {
      fields.push('scale_down = ?');
      params.push(updateData.scaleDown);
    }
    if (updateData.logoPosition !== undefined) {
      fields.push('logo_position = ?');
      params.push(updateData.logoPosition);
    }
    if (updateData.logoData !== undefined) {
      fields.push('logo_data = ?');
      params.push(updateData.logoData);
    }
    if (updateData.logoMimeType !== undefined) {
      fields.push('logo_mime_type = ?');
      params.push(updateData.logoMimeType);
    }
    if (updateData.logoFileName !== undefined) {
      fields.push('logo_file_name = ?');
      params.push(updateData.logoFileName);
    }
    if (updateData.logoFileSize !== undefined) {
      fields.push('logo_file_size = ?');
      params.push(updateData.logoFileSize);
    }
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      params.push(updateData.description);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at timestamp and WHERE clause parameters
    fields.push('updated_at = NOW()');
    params.push(id, userId);

    const query = `
      UPDATE configurations 
      SET ${fields.join(', ')} 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `;

    try {
      const [result] = await db.execute(query, params);
      if (result.affectedRows === 0) {
        return null; // Configuration not found or user doesn't own it
      }
      return await Configuration.findByIdAndUser(id, userId);
    } catch (error) {
      console.error('Error updating user configuration:', error);
      throw new Error('Failed to update configuration');
    }
  }

  // Soft delete configuration (keeping original method)
  static async delete(id) {
    const db = createConnection();
    const query = 'UPDATE configurations SET is_active = 0, updated_at = NOW() WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting configuration:', error);
      throw new Error('Failed to delete configuration');
    }
  }

  // NEW: Delete configuration for specific user
  static async deleteByUser(id, userId) {
    const db = createConnection();
    const query = 'UPDATE configurations SET is_active = 0, updated_at = NOW() WHERE id = ? AND user_id = ?';
    
    try {
      const [result] = await db.execute(query, [id, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user configuration:', error);
      throw new Error('Failed to delete configuration');
    }
  }

  // Convert instance to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      userId: this.userId, // Include user ID in JSON output
      scaleDown: this.scaleDown,
      logoPosition: this.logoPosition,
      hasLogo: !!(this.logoData || this.logoFileName), 
      isActive: Boolean(this.isActive),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      logoData: this.logoData ? this.logoData.toString('base64') : null
    };
  }
}

module.exports = Configuration;