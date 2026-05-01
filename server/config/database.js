import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management';
    
    await mongoose.connect(mongoURI);

    console.log('[v0] MongoDB Connected Successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('[v0] MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
