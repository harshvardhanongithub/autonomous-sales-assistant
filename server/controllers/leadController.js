import Lead from '../models/Lead.js';
import { analyzeLeadWithAI } from '../services/aiService.js';

// @desc    Get all leads for logged-in user
// @route   GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.user._id }).sort({ score: -1, createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch leads' });
  }
};

// @desc    Create a new lead with Real-Time AI Scoring
// @route   POST /api/leads
export const createLead = async (req, res) => {
  try {
    const { name, email, company, notes, status } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({ message: 'Name, email, and company are required' });
    }

    // Call Gemini AI Engine to analyze the prospect
    const aiResult = await analyzeLeadWithAI({ name, email, company, notes });

    const lead = await Lead.create({
      user: req.user._id,
      name,
      email,
      company,
      notes: notes || '',
      status: status || 'New',
      score: aiResult.score,
      qualificationReason: aiResult.qualificationReason,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create lead' });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await lead.deleteOne();
    res.json({ message: 'Lead removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete lead' });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    lead.status = status || lead.status;
    await lead.save();

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update lead status' });
  }
};