import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Lead from './models/Lead.js';
import User from './models/User.js';
import { analyzeLeadWithAI } from './services/aiService.js';

dotenv.config();

const sampleLeads = [
  {
    name: 'Eleanor Vance',
    email: 'eleanor@vancetech.io',
    company: 'Vance Tech Solutions',
    notes: 'Urgent requirement! $80k approved budget for enterprise AI deployment across 200 seats this month.',
    status: 'New',
  },
  {
    name: 'Marcus Brody',
    email: 'm.brody@museumcorp.org',
    company: 'Brody Cultural Group',
    notes: 'Interested in software package, looking for quote and timeline details.',
    status: 'Contacted',
  },
  {
    name: 'Sophia Patel',
    email: 'sophia@nexuscloud.com',
    company: 'Nexus Cloud Systems',
    notes: 'Approved budget of $120k for immediate migration. High urgency decision maker.',
    status: 'Qualified',
  },
  {
    name: 'Julian Thorne',
    email: 'julian@thornefinance.com',
    company: 'Thorne Financial',
    notes: 'Just browsing pricing options. No active project budget at this time.',
    status: 'New',
  },
  {
    name: 'Claire Redfield',
    email: 'c.redfield@terrasave.org',
    company: 'TerraSave Logistics',
    notes: 'Looking to purchase 50 licenses by next quarter. Moderate timeline urgency.',
    status: 'Contacted',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB Atlas for seeding...');

    // Find or automatically create the target demo user
    let user = await User.findOne({ email: 'hm12345@gmail.com' });

    if (!user) {
      console.log('👤 User hm12345@gmail.com not found. Creating account automatically...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = await User.create({
        name: 'Harsh',
        email: 'hm12345@gmail.com',
        password: hashedPassword,
        role: 'Sales Rep'
      });
      console.log('✅ Demo user created: Harsh (hm12345@gmail.com)');
    } else {
      console.log(`👤 Found user: ${user.name} (${user.email})`);
    }

    // Process each lead through the AI scoring engine
    const processedLeads = [];
    for (const lead of sampleLeads) {
      console.log(`🤖 AI evaluating lead: ${lead.name}...`);
      const aiResult = await analyzeLeadWithAI(lead);

      processedLeads.push({
        ...lead,
        user: user._id,
        score: aiResult.score,
        qualificationReason: aiResult.qualificationReason,
      });
    }

    // Insert into MongoDB Atlas
    await Lead.insertMany(processedLeads);
    console.log('🎉 Successfully seeded 5 AI-evaluated prospects into MongoDB Atlas!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();