import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chatsSnapshot = await db.collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    const chats = await Promise.all(chatsSnapshot.docs.map(async (doc) => {
      const chatData = { id: doc.id, ...doc.data() };
      
      // Get other user info
      const otherUserId = chatData.participants.find(id => id !== userId);
      const otherUserDoc = await db.collection('users').doc(otherUserId).get();
      chatData.otherUser = otherUserDoc.exists ? {
        id: otherUserDoc.id,
        fullName: otherUserDoc.data().fullName,
        profileImage: otherUserDoc.data().profileImage,
        role: otherUserDoc.data().role
      } : null;

      // Get last message
      const messagesSnapshot = await db.collection('chats')
        .doc(doc.id)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!messagesSnapshot.empty) {
        const lastMsg = messagesSnapshot.docs[0].data();
        chatData.lastMessage = lastMsg.text || 'File attachment';
      }

      // Count unread messages
      const unreadSnapshot = await db.collection('chats')
        .doc(doc.id)
        .collection('messages')
        .where('readBy', 'not-in', [[userId]])
        .get();
      
      chatData.unreadCount = unreadSnapshot.size;

      return chatData;
    }));

    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

export const createChat = async (req, res) => {
  try {
    const { otherUserId, projectId } = req.body;
    const userId = req.user.userId;

    // Check if chat already exists
    const existingChat = await db.collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    let chatId = null;
    for (const doc of existingChat.docs) {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        chatId = doc.id;
        break;
      }
    }

    if (!chatId) {
      // Create new chat
      const chatData = {
        participants: [userId, otherUserId],
        projectId: projectId || null,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      };

      const chatRef = await db.collection('chats').add(chatData);
      chatId = chatRef.id;
    }

    res.status(201).json({ success: true, chatId });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const fileUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/chat-files');

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};
