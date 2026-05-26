// backend/index.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

const app = express();
connectDB(); // connect to MongoDB

app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));