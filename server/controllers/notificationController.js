import { db } from '../config/firebase.js';

// Create notification
export const createNotification = async (recipientId, senderId, type, data = {}) => {
  try {
    const notificationData = {
      recipientId,
      senderId,
      type, // "follow" | "like" | "comment" | "application" | "job_match" | "new_post" | "message"
      data: data, // Store all additional data here
      postId: data.postId || null,
      jobId: data.jobId || null,
      jobTitle: data.jobTitle || null,
      postContent: data.postContent || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    await db.collection('notifications').add(notificationData);
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const notificationsSnapshot = await db.collection('notifications')
      .where('recipientId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const notifications = await Promise.all(notificationsSnapshot.docs.map(async (doc) => {
      const notifData = { id: doc.id, ...doc.data() };
      
      // Get sender info
      if (notifData.senderId) {
        const senderDoc = await db.collection('users').doc(notifData.senderId).get();
        notifData.fromUser = senderDoc.exists ? {
          fullName: senderDoc.data().fullName,
          profileImage: senderDoc.data().profileImage,
          role: senderDoc.data().role
        } : null;
      }

      return notifData;
    }));

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notifDoc = await db.collection('notifications').doc(notificationId).get();
    
    if (!notifDoc.exists) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notifDoc.data().recipientId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.collection('notifications').doc(notificationId).update({
      read: true
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notificationsSnapshot = await db.collection('notifications')
      .where('recipientId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadSnapshot = await db.collection('notifications')
      .where('recipientId', '==', userId)
      .where('read', '==', false)
      .get();

    res.json({ success: true, count: unreadSnapshot.size });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};
