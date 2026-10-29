const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/budget_tracker';
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB Runtime Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
    });

    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
