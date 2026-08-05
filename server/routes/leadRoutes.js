import express from 'express';
import { getLeads, createLead, deleteLead, updateLeadStatus } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .delete(protect, deleteLead)
  .patch(protect, updateLeadStatus);

export default router;