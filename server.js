require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Aylux Majesty API is running...');
});

// Routes
app.use('/api/products', require('./Routes/productRoutes'));
app.use('/api/orders', require('./Routes/orderRoutes'));
app.use('/api/feedback', require('./Routes/feedbackRoutes'));

// PORT
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
