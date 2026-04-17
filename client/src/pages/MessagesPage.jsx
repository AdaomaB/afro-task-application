import { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Search, MoreVertical } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const { dark } = useDarkMode();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isFreelancer = user?.role === 'freelancer';

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select chat from URL params
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && conversations.length > 0) {
      const chat = conversations.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
      } else {
        // Chat exists but not in list yet — fetch it directly
        api.get('/pre-project-chats/my-chats').then(res => {
          const found = (res.data.chats || []).find(c => c.id === chatId);
          if (found) setSelectedChat(found);
        }).catch(() => {});
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/pre-project-chats/my-chats');
      setConversations(response.data.chats || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat?.id) return;
    
    try {
      console.log('Fetching messages for chat:', selectedChat.id);
      const response = await api.get(`/pre-project-chats/${selectedChat.id}/messages?limit=50`);
      console.log('Messages received:', response.data.messages?.length || 0);
      const msgs = response.data.messages || [];
      setMessages(msgs);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('text', newMessage);

      await api.post(`/pre-project-chats/${selectedChat.id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Message sent successfully');
      toast.success('Message sent!');

      setNewMessage('');
      setShowEmojiPicker(false);
      
      // Immediately fetch messages to show the new one
      await fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    if (!selectedChat) return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setSelectedFiles(files);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('text', '');
        formData.append('file', file);

        await api.post(`/pre-project-chats/${selectedChat.id}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
      
      // Immediately fetch messages to show the new ones
      await fetchMessages();
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      // Reset input
      e.target.value = '';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <Navbar />
        
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
            <div className={`p-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-none">
              {conversations.map((conv) => {
                const lastMessageText = conv.lastMessage?.text || 
                                       (conv.lastMessage?.fileUrl ? '📎 File' : 'No messages yet');
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv)}
                    className={`w-full p-4 flex items-center gap-3 overflow-x-hidden transition ${
                      selectedChat?.id === conv.id
                        ? dark ? 'bg-green-900/40' : 'bg-green-50'
                        : dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={conv.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser?.fullName || 'User')}`}
                      alt={conv.otherUser?.fullName || 'User'}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{conv.otherUser?.fullName || 'Unknown User'}</p>
                      <p className={`text-sm truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{lastMessageText}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className={`p-8 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className={`p-4 border-b flex items-center justify-between ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className={`md:hidden p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <svg className={`w-6 h-6 ${dark ? 'text-gray-300' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <img
                      src={selectedChat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${selectedChat.otherUser?.fullName}`}
                      alt={selectedChat.otherUser?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{selectedChat.otherUser?.fullName}</p>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedChat.otherUser?.role}</p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <MoreVertical className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <AnimatePresence>
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <img
                              src={
                                isOwn 
                                  ? (user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'You')}`)
                                  : (selectedChat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.otherUser?.fullName || 'User')}`)
                              }
                              alt={isOwn ? 'You' : selectedChat.otherUser?.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              {message.text && (
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isOwn 
                                    ? isFreelancer ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                                    : dark ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'
                                }`}>
                                  <p className="text-sm">{String(message.text)}</p>
                                </div>
                              )}
                              {message.fileUrl && (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block px-4 py-3 rounded-2xl hover:opacity-80 transition ${
                                    isOwn
                                      ? dark ? 'bg-green-900/50 text-green-100' : 'bg-green-100'
                                      : dark ? 'bg-gray-700 text-gray-100' : 'bg-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    <div>
                                      <p className="text-sm font-medium">{message.fileName || 'File'}</p>
                                      {message.fileSize && (
                                        <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{formatFileSize(message.fileSize)}</p>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              )}
                              <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{formatTime(message.createdAt)}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className={`p-4 border-t ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title={uploading ? 'Uploading...' : 'Attach files (multiple supported)'}
                    >
                      <Paperclip className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                      {uploading && <span className="ml-1 text-xs">...</span>}
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`w-full px-4 py-3 pr-12 border rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      >
                        <Smile className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setNewMessage(prev => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                            theme={dark ? 'dark' : 'light'}
                            width={300}
                            height={400}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-full transition disabled:opacity-50 ${
                        isFreelancer 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      } text-white`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${dark ? 'bg-gray-900 text-gray-400' : 'text-gray-500'}`}>
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
