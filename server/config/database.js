import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management';
    
    console.log('[Server] Connecting to MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 4500,
    });

    console.log('[Server] MongoDB Connected Successfully');
    console.log('[Server] Database:', mongoose.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[Server] MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('[Server] MongoDB disconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('[Server] MongoDB Connection Error:', error.message);
    console.error('[Server] Make sure MongoDB is running on your machine');
    process.exit(1);
  }
};

export default connectDB;
