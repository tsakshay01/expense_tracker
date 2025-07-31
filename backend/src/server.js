// Load environment variables from .env file FIRST
// This line MUST be at the very top of your server.js file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors middleware
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();

// Retrieve environment variables
const PORT = process.env.PORT || 5000;
const MDB_URI = process.env.MDB_URI;

// --- CRITICAL CHECK FOR MDB_URI ---
// This will make it very clear if MDB_URI is still undefined
if (!MDB_URI) {
    console.error("\nCRITICAL ERROR: MDB_URI is not defined in your .env file.");
    console.error("Please ensure you have a .env file in the 'backend' folder with MDB_URI set.");
    console.error("Example: MDB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority");
    process.exit(1); // Exit the application if MDB_URI is missing
}
// ---------------------------------

// Connect to MongoDB
mongoose.connect(MDB_URI)
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Exit the process if the database connection fails
    // This is important because the app can't function without the database
    process.exit(1);
  });

// Middleware
app.use(cors()); // Enable CORS for all origins by default
app.use(express.json()); // Body parser for JSON requests (replaces body-parser)

// Basic route for testing API status
app.get('/', (req, res) => {
  res.send('Expense Planner API is running...');
});

// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});