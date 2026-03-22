import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from './notificationController.js';

// Get project chat
export const getProjectChat = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Get project to verify access
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data();
    
    // Verify user is either client or freelancer
    if (projectData.clientId !== userId && projectData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get chat
    const chatsSnapshot = await db.collection('projectChats')
      .where('projectId', '==', projectId)
      .where('active', '==', true)
      .get();

    if (chatsSnapshot.empty) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatDoc = chatsSnapshot.docs[0];
    const chatData = { id: chatDoc.id, ...chatDoc.data() };

    res.json({ success: true, chat: chatData });
  } catch (error) {
    console.error('Get project chat error:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

// Get messages for a project chat
export const getProjectChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 20, startAfter } = req.query;
    const userId = req.user.userId;

    // Verify access to chat
    const chatDoc = await db.collection('projectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let query = db.collection('projectChats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('projectChats')
        .doc(chatId)
        .collection('messages')
        .doc(startAfter)
        .get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const messagesSnapshot = await query.get();
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Get project chat messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Send message in project chat
export const sendProjectMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    // Verify access to chat
    const chatDoc = await db.collection('projectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!chatData.active) {
      return res.status(400).json({ message: 'Chat is no longer active' });
    }

    const messageData = {
      senderId: userId,
      text: text || '',
      fileUrl: null,
      fileName: null,
      fileType: null,
      fileSize: null,
      createdAt: new Date().toISOString(),
      readBy: [userId]
    };

    // Handle file upload if present
    if (req.file) {
      try {
        console.log('Uploading file to Cloudinary:', req.file.originalname);
        
        // Determine resource type based on file mimetype
        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isVideo ? 'video' : isImage ? 'image' : 'raw';
        
        const fileUrl = await uploadToCloudinary(
          req.file.buffer, 
          `project-chat-files/${chatId}`,
          resourceType
        );
        
        messageData.fileUrl = fileUrl;
        messageData.fileName = req.file.originalname;
        messageData.fileType = req.file.mimetype;
        messageData.fileSize = req.file.size;
        console.log('File uploaded successfully:', fileUrl);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload file' });
      }
    }

    const messageRef = await db.collection('projectChats')
      .doc(chatId)
      .collection('messages')
      .add(messageData);

    // Send notification to the other user
    const recipientId = chatData.clientId === userId ? chatData.freelancerId : chatData.clientId;
    try {
      await createNotification(recipientId, userId, 'message', { 
        chatId,
        messagePreview: text?.substring(0, 50) || 'Sent a file'
      });
    } catch (notifError) {
      console.error('Failed to send message notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: { id: messageRef.id, ...messageData }
    });
  } catch (error) {
    console.error('Send project message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark project messages as read
export const markProjectMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.userId;

    // Verify access to chat
    const chatDoc = await db.collection('projectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update messages
    const batch = db.batch();
    for (const messageId of messageIds) {
      const messageRef = db.collection('projectChats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId);
      
      const messageDoc = await messageRef.get();
      if (messageDoc.exists) {
        const readBy = messageDoc.data().readBy || [];
        if (!readBy.includes(userId)) {
          batch.update(messageRef, {
            readBy: [...readBy, userId]
          });
        }
      }
    }

    await batch.commit();

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark project messages as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};
