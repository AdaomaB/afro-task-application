import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

const PreProjectChat = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChatData();
  }, [applicationId]);

  useEffect(() => {
    if (chat?.id) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      console.log('Fetching chat for application:', applicationId);
      const response = await api.get(`/pre-project-chats/application/${applicationId}`);
      console.log('Chat data received:', response.data);
      setChat(response.data.chat);
    } catch (error) {
      console.error('Chat fetch error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || 'Failed to load chat';
      
      // Show specific error messages
      if (error.response?.status === 403) {
        toast.error('You are not authorized to view this chat. This chat belongs to a different user.');
      } else if (error.response?.status === 404) {
        toast.error('Chat not found. Please start a chat from the application first.');
      } else {
        toast.error(errorMsg);
      }
      
      setTimeout(() => navigate(-1), 2500);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chat?.id) return;
    
    try {
      console.log('Fetching messages for chat:', chat.id);
      const response = await api.get(`/pre-project-chats/${chat.id}/messages?limit=50`);
      console.log('Messages received:', response.data.messages?.length || 0);
      const msgs = response.data.messages || [];
      setMessages(msgs);
      markMessagesAsRead(msgs);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const setupRealtimeMessages = () => {
    const messagesRef = collection(db, 'preProjectChats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      markMessagesAsRead(msgs);
    });

    return () => unsubscribe();
  };

  const markMessagesAsRead = async (msgs) => {
    const unreadIds = msgs
      .filter(msg => msg.senderId !== user.id && !(msg.readBy || []).includes(user.id))
      .map(msg => msg.id);

    if (unreadIds.length > 0) {
      try {
        await api.post(`/pre-project-chats/${chat.id}/mark-read`, { messageIds: unreadIds });
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    setSending(true);
    try {
      console.log('Sending message to chat:', chat.id);
      console.log('Message text:', newMessage);
      
      const formData = new FormData();
      formData.append('text', newMessage);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await api.post(`/pre-project-chats/${chat.id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Message sent successfully:', response.data);
      
      toast.success('Message sent!');

      // Immediately fetch messages to show the new one
      await fetchMessages();

      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptApplication = async () => {
    setShowAcceptModal(false);
    
    try {
      const response = await api.post(`/applications/${applicationId}/accept`);
      toast.success('Application accepted! Project created.');
      navigate(`/project/${response.data.projectId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept application');
    }
  };

  const downloadFile = (fileUrl, fileName) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const isClient = user?.role === 'client';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <img
              src={chat?.otherUser?.profileImage}
              alt={chat?.otherUser?.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-bold text-lg">{chat?.otherUser?.fullName}</h2>
              <p className="text-sm text-gray-600">{chat?.job?.title}</p>
            </div>
          </div>
          {isClient && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
            >
              Accept & Start Project
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Debug info */}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.senderId === user.id;
            const profileImage = isOwn 
              ? (user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'You')}`)
              : (chat?.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.otherUser?.fullName || 'User')}`);
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <img
                    src={profileImage}
                    alt={chat?.otherUser?.fullName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className={`max-w-md ${isOwn ? 'bg-green-500 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-3 shadow`}>
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  {msg.fileUrl && (
                    <div className="mt-2 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{msg.fileName}</span>
                      </div>
                      <button
                        onClick={() => downloadFile(msg.fileUrl, msg.fileName)}
                        className="mt-2 text-sm underline"
                      >
                        Download
                      </button>
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-70">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </p>
                </div>
                {isOwn && (
                  <img
                    src={profileImage}
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <span>📎 {selectedFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
              accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              📎
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Accept Application Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Accept Application</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this application and start the project? This action will create a new project workspace.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptApplication}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                Accept & Start Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreProjectChat;
