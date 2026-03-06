import { db, bucket } from '../config/firebase.js';

export const getPreProjectChat = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const appDoc = await db.collection('applications').doc(applicationId).get();
    if (!appDoc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const appData = appDoc.data();
    if (appData.clientId !== userId && appData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const chatsSnapshot = await db.collection('preProjectChats')
      .where('applicationId', '==', applicationId)
      .where('active', '==', true)
      .get();
    if (chatsSnapshot.empty) {
      return res.status(404).json({ message: 'Chat not found' });
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
    const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const chatDoc = await db.collection('preProjectChats').doc(chatId).get();
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
    if (req.file) {
      const file = req.file;
      const fileName = `chat-files/${chatId}/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);
      await fileUpload.save(file.buffer, { 
        metadata: { contentType: file.mimetype } 
      });
      await fileUpload.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      messageData.fileUrl = fileUrl;
      messageData.fileName = file.originalname;
      messageData.fileType = file.mimetype;
      messageData.fileSize = file.size;
    }
    const messageRef = await db.collection('preProjectChats')
      .doc(chatId)
      .collection('messages')
      .add(messageData);
    res.status(201).json({ 
      success: true, 
      message: { id: messageRef.id, ...messageData } 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
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
