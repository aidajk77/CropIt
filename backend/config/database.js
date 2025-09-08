const mysql = require('mysql2/promise');

let pool = null;

const createConnection = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'image_cropper',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      idleTimeout: 60000,        
      acquireTimeout: 60000,
    });

    console.log('📊 MySQL connection pool created');
  }
  return pool;
};

const testConnection = async () => {
  try {
    const connection = createConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const closeConnection = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
};

// Initialize database on first import
const initDatabase = async () => {
  const connection = createConnection();
  
  // Test connection
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to database');
  }

  return connection;
};

module.exports = {
  createConnection,
  testConnection,
  closeConnection,
  initDatabase
};