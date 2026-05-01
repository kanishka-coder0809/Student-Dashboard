import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import studentRoutes from './routes/students.js';
import marksRoutes from './routes/marks.js';
import classesRoutes from './routes/classes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/classes', classesRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[v0] Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`[v0] Express server running on http://localhost:${PORT}`);
});

export default app;
