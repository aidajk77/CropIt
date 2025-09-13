const { verifyToken } = require('@clerk/clerk-sdk-node');

const verifyClerkToken = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No Bearer token provided' });
    }

    const token = authHeader.split(' ')[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    req.auth = payload;
    next();
    
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ 
      error: 'Invalid token',
      details: error.message 
    });
  }
};

const extractUserId = (req, res, next) => {
  
  const userId = req.auth?.sub;
  
  if (!userId) {
    return res.status(401).json({ error: 'No user ID in token' });
  }
  
  req.userId = userId;
  next();
};

module.exports = { verifyClerkToken, extractUserId };