import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from './notificationController.js';

export const getPreProjectChat = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    
    console.log('Getting pre-project chat for application:', applicationId);
    console.log('User ID:', userId);
    
    const appDoc = await db.collection('applications').doc(applicationId).get();
    if (!appDoc.exists) {
      console.log('Application not found:', applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const appData = appDoc.data();
    console.log('Application data:', { clientId: appData.clientId, freelancerId: appData.freelancerId });
    
    if (appData.clientId !== userId && appData.freelancerId !== userId) {
      console.log('Unauthorized access attempt. User:', userId, 'Client:', appData.clientId, 'Freelancer:', appData.freelancerId);
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const chatsSnapshot = await db.collection('preProjectChats')
      .where('applicationId', '==', applicationId)
      .where('active', '==', true)
      .get();
      
    if (chatsSnapshot.empty) {
      console.log('No active chat found for application:', applicationId);
      return res.status(404).json({ message: 'Chat not found. Please start a chat first.' });
    }
    
    const chatDoc = chatsSnapshot.docs[0];
    const chatData = { id: chatDoc.id, ...chatDoc.data() };
    const jobDoc = await db.collection('jobs').doc(chatData.jobId).get();
    chatData.job = jobDoc.exists ? jobDoc.data() : null;
    chatData.application = appData;
    const otherUserId = userId === chatData.clientId ? chatData.freelancerId : chatData.clientId;
    const otherUserDoc = await db.collection('users').doc(otherUserId).get();
    chatData.otherUser = otherUserDoc.exists ? {
      uid: otherUserId,
      fullName: otherUserDoc.data().fullName,
      profileImage: otherUserDoc.data().profileImage,
      role: otherUserDoc.data().role
    } : null;
    
    console.log('Chat found successfully:', chatDoc.id);
    res.json({ success: true, chat: chatData });
  } catch (error) {
    console.error('Get pre-project chat error:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 20, startAfter } = req.query;
    const userId = req.user.userId;
    const chatDoc = await db.collection('preProjectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    let query = db.collection('preProjectChats').doc(chatId).collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    if (startAfter) {
      const startDoc = await db.collection('preProjectChats').doc(chatId)
        .collection('messages').doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }
    const messagesSnapshot = await query.get();
    const messages = await Promise.all(messagesSnapshot.docs.map(async (doc) => {
      const msgData = { id: doc.id, ...doc.data() };
      
      // Fetch sender profile data
      try {
        const senderDoc = await db.collection('users').doc(msgData.senderId).get();
        if (senderDoc.exists) {
          const senderData = senderDoc.data();
          msgData.senderName = senderData.fullName;
          msgData.senderImage = senderData.profileImage;
        }
      } catch (error) {
        console.error('Error fetching sender data:', error);
      }
      
      return msgData;
    }));
    console.log(`Returning ${messages.length} messages for chat ${chatId}`);
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    console.log('Sending message to chat:', chatId);
    console.log('User ID:', userId);
    console.log('Message text:', text);
    console.log('Has file:', !!req.file);

    const chatDoc = await db.collection('preProjectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      console.log('Unauthorized send attempt');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!chatData.active) {
      console.log('Chat is not active');
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

    // Handle file upload using Cloudinary
    if (req.file) {
      try {
        console.log('Uploading file to Cloudinary:', req.file.originalname);
        
        // Determine resource type based on file mimetype
        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isVideo ? 'video' : isImage ? 'image' : 'raw';
        
        const fileUrl = await uploadToCloudinary(
          req.file.buffer, 
          `chat-files/${chatId}`,
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

    const messageRef = await db.collection('preProjectChats')
      .doc(chatId)
      .collection('messages')
      .add(messageData);

    console.log('Message saved successfully:', messageRef.id);
    console.log('Message data:', messageData);

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

    // Fetch sender profile data to include in response
    const senderDoc = await db.collection('users').doc(userId).get();
    const savedMessage = { id: messageRef.id, ...messageData };
    if (senderDoc.exists) {
      const senderData = senderDoc.data();
      savedMessage.senderName = senderData.fullName;
      savedMessage.senderImage = senderData.profileImage;
    }

    res.status(201).json({ 
      success: true, 
      message: savedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.userId;
    const chatDoc = await db.collection('preProjectChats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const chatData = chatDoc.data();
    if (chatData.clientId !== userId && chatData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const batch = db.batch();
    for (const messageId of messageIds) {
      const messageRef = db.collection('preProjectChats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId);
      const messageDoc = await messageRef.get();
      if (messageDoc.exists) {
        const readBy = messageDoc.data().readBy || [];
        if (!readBy.includes(userId)) {
          batch.update(messageRef, { readBy: [...readBy, userId] });
        }
      }
    }
    await batch.commit();
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

export const getMyPreProjectChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    let chatsSnapshot;
    if (req.user.role === 'client') {
      chatsSnapshot = await db.collection('preProjectChats')
        .where('clientId', '==', userId)
        .where('active', '==', true)
        .get();
    } else {
      chatsSnapshot = await db.collection('preProjectChats')
        .where('freelancerId', '==', userId)
        .where('active', '==', true)
        .get();
    }
    const chats = await Promise.all(chatsSnapshot.docs.map(async (doc) => {
      const chatData = { id: doc.id, ...doc.data() };
      const jobDoc = await db.collection('jobs').doc(chatData.jobId).get();
      chatData.job = jobDoc.exists ? jobDoc.data() : null;
      const otherUserId = userId === chatData.clientId ? chatData.freelancerId : chatData.clientId;
      const otherUserDoc = await db.collection('users').doc(otherUserId).get();
      chatData.otherUser = otherUserDoc.exists ? {
        uid: otherUserId,
        fullName: otherUserDoc.data().fullName,
        profileImage: otherUserDoc.data().profileImage,
        role: otherUserDoc.data().role
      } : null;
      const lastMessageSnapshot = await db.collection('preProjectChats')
        .doc(doc.id)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (!lastMessageSnapshot.empty) {
        chatData.lastMessage = { 
          id: lastMessageSnapshot.docs[0].id, 
          ...lastMessageSnapshot.docs[0].data() 
        };
      }
      const unreadSnapshot = await db.collection('preProjectChats')
        .doc(doc.id)
        .collection('messages')
        .where('senderId', '!=', userId)
        .get();
      chatData.unreadCount = unreadSnapshot.docs.filter(msgDoc => {
        const readBy = msgDoc.data().readBy || [];
        return !readBy.includes(userId);
      }).length;
      return chatData;
    }));
    chats.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get my pre-project chats error:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};
