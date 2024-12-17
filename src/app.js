const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const designerMiddleware = require('./middlewares/designerMiddleware');

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const followRoutes = require('./routes/followRoutes');
const designerRoutes = require('./routes/designerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);             
app.use('/api/player',authMiddleware, playerRoutes);
app.use('/api/follow',authMiddleware, followRoutes);
app.use('/api/designer',designerMiddleware, designerRoutes);



module.exports = app;
