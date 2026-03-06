import express from 'express';
import { addReview, getFreelancerReviews, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Add a review for a freelancer
router.post('/:freelancerId', protect, addReview);

// Get all reviews for a freelancer
router.get('/:freelancerId', getFreelancerReviews);

// Delete a review
router.delete('/:reviewId', protect, deleteReview);

export default router;
