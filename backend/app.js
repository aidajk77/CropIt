const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const app = express();

// Load environment variables
dotenv.config({ path: 'config/config.env' });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Routes
const imageRoutes = require('./routes/imageRoutes');
const configRoutes = require('./routes/configRoutes');

app.use('/api/image', imageRoutes);
app.use('/api/config', configRoutes);


// Error handling middleware
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;