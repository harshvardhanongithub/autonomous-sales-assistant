import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a contact name'],
    },
    email: {
      type: String,
      required: [true, 'Please add a contact email'],
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Closed'],
      default: 'New',
    },
    score: {
      type: Number,
      default: 0,
    },
    qualificationReason: {
      type: String,
      default: 'Pending AI Analysis...',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;