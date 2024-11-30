const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);             
app.use('/api/player',authMiddleware, playerRoutes);



module.exports = app;
