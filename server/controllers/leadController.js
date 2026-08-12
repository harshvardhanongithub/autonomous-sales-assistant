import Lead from '../models/Lead.js';
import { analyzeLead } from '../services/aiService.js';

// @desc    Create a new sales lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res) => {
  try {
    const { name, email, company, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Pass lead context through the unified AI / n8n pipeline
    const analysis = await analyzeLead({ name, email, company, notes });

    const lead = await Lead.create({
      name,
      email,
      company,
      notes,
      score: analysis.score,
      aiSummary: analysis.summary,
      user: req.user._id,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create lead' });
  }
};

// @desc    Get all leads for logged-in user
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to retrieve leads' });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id
// @access  Private
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    lead.status = status;
    await lead.save();

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update lead status' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this lead' });
    }

    await lead.deleteOne();
    res.status(200).json({ message: 'Lead successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete lead' });
  }
};