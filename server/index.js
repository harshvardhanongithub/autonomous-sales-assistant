import dotenv from 'dotenv';
dotenv.config();

// Fail loud immediately at boot time if critical secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing. Halting startup.');
  process.exit(1);
}

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});