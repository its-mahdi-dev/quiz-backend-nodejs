const jwt = require('jsonwebtoken');
const secretKey = 'web-2024-nodejs';

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'لطفا وارد حساب کاربری خود شوید' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Add user info to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'توکن نامعتبر' });
  }
};

module.exports = authMiddleware;
