const { createConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Configuration {
  constructor(data) {
    this.id = data.id;
    this.scaleDown = data.scale_down;
    this.logoPosition = data.logo_position;
    this.logoFileName = data.logo_file_name;
    this.logoFileSize = data.logo_file_size;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.description = data.description;
    this.logoData = data.logo_data;
    this.logoMimeType = data.logo_mime_type;
  }

  // Create new configuration
  static async create(configData) {
    const db = createConnection();
    const id = uuidv4();
    
    const query = `
      INSERT INTO configurations (
        id, scale_down, logo_position,logo_file_name,
        logo_file_size, description, logo_data, logo_mime_type 
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      configData.scaleDown || null,
      configData.logoPosition || 'top-left',
      configData.logoFileName || null,
      configData.logoFileSize || null,
      configData.description || null,
      configData.logoData || null,
      configData.logoMimeType || null
    ];

    try {
      await db.execute(query, params);
      return await Configuration.findById(id);
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw new Error('Failed to create configuration');
    }
  }

  // Find configuration by ID
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

  // Find all active configurations
  static async findAll(limit = 50, offset = 0) {
    const db = createConnection();

    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;

    const query = `
      SELECT * FROM configurations 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    try {
      const [rows] = await db.execute(query, [limit, offset]);
      return rows.map(row => new Configuration(row));
    } catch (error) {
      console.error('Error finding configurations:', error);
      throw new Error('Failed to retrieve configurations');
    }
  }

  // Update existing configuration
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
    if (updateData.logoFilePath !== undefined) {
      fields.push('logo_file_path = ?');
      params.push(updateData.logoFilePath);
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

  // Soft delete configuration
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

  // Convert instance to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      scaleDown: this.scaleDown,
      logoPosition: this.logoPosition,
      logoFileName: this.logoFileName,
      logoFileSize: this.logoFileSize,
      hasLogo: !!(this.logoData || this.logoFileName), 
      isActive: Boolean(this.isActive),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description
    };
  }
}

module.exports = Configuration;