import { db } from '../config/firebase.js';
import { calculateRankingScore } from './rankingController.js';

// Add a review
export const addReview = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { rating, comment, projectId } = req.body;
    const reviewerId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ message: 'Comment must be at least 10 characters' });
    }

    // Check if user already reviewed this freelancer for this project
    if (projectId) {
      const existingReview = await db.collection('reviews')
        .where('freelancerId', '==', freelancerId)
        .where('reviewerId', '==', reviewerId)
        .where('projectId', '==', projectId)
        .get();

      if (!existingReview.empty) {
        return res.status(400).json({ message: 'You already reviewed this freelancer for this project' });
      }
    }

    const reviewData = {
      freelancerId,
      reviewerId,
      projectId: projectId || null,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    const reviewRef = await db.collection('reviews').add(reviewData);

    // Get reviewer info
    const reviewerDoc = await db.collection('users').doc(reviewerId).get();
    const reviewerData = reviewerDoc.data();

    // Update freelancer's ranking score
    await calculateRankingScore(freelancerId);

    res.status(201).json({
      success: true,
      review: {
        id: reviewRef.id,
        ...reviewData,
        reviewer: {
          fullName: reviewerData.fullName,
          profileImage: reviewerData.profileImage
        }
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

// Get reviews for a freelancer
export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { limit = 20 } = req.query;

    // Get all reviews for this freelancer (without orderBy to avoid index requirement)
    const reviewsSnapshot = await db.collection('reviews')
      .where('freelancerId', '==', freelancerId)
      .limit(Number(limit))
      .get();

    const reviews = [];
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      
      // Get reviewer info
      const reviewerDoc = await db.collection('users').doc(reviewData.reviewerId).get();
      const reviewerData = reviewerDoc.data();

      reviews.push({
        id: doc.id,
        ...reviewData,
        reviewer: {
          id: reviewData.reviewerId,
          fullName: reviewerData?.fullName || 'Unknown User',
          profileImage: reviewerData?.profileImage || null
        }
      });
    }

    // Sort by createdAt in memory (since we can't use orderBy without index)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
      averageRating: Number(averageRating)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Delete a review (only by reviewer)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const reviewDoc = await db.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviewData = reviewDoc.data();
    
    if (reviewData.reviewerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.collection('reviews').doc(reviewId).delete();

    // Update freelancer's ranking score
    await calculateRankingScore(reviewData.freelancerId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};
