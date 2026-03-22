import { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';
import { calculateRankingScore } from './rankingController.js';

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    if (followerId === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await db.collection('follows')
      .where('followerId', '==', followerId)
      .where('followingId', '==', userId)
      .get();

    if (!existingFollow.empty) {
      // Unfollow
      await db.collection('follows').doc(existingFollow.docs[0].id).delete();
      return res.json({ success: true, following: false });
    }

    // Follow
    await db.collection('follows').add({
      followerId,
      followingId: userId,
      createdAt: new Date().toISOString()
    });

    // Create notification
    await createNotification(userId, followerId, 'follow');

    // Update ranking score for the followed user
    await calculateRankingScore(userId);

    res.json({ success: true, following: true });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Failed to follow user' });
  }
};

export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const existingFollow = await db.collection('follows')
      .where('followerId', '==', followerId)
      .where('followingId', '==', userId)
      .get();

    res.json({
      success: true,
      following: !existingFollow.empty
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Failed to check follow status' });
  }
};

export const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Getting follow stats for userId:', userId);

    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();

    const followingSnapshot = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();

    console.log('Followers count:', followersSnapshot.size);
    console.log('Following count:', followingSnapshot.size);
    
    // Debug: Log all follow documents
    console.log('All followers:');
    followersSnapshot.forEach(doc => {
      console.log('  -', doc.id, doc.data());
    });

    res.json({
      success: true,
      followersCount: followersSnapshot.size,
      followingCount: followingSnapshot.size
    });
  } catch (error) {
    console.error('Get follow stats error:', error);
    res.status(500).json({ message: 'Failed to fetch follow stats' });
  }
};
