import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

dotenv.config();

connectDB();

const app = express();

// Enable full CORS for dev environment
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => {
  res.send('AI Sales Assistant API is running on Port 5001...');
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});