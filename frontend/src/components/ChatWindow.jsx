import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, MessageSquare, Send, X, ChevronUp } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const Message = React.memo(({ message }) => (
  <div className={`flex ${message.fromSelf ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[70%] ${
      message.fromSelf 
        ? 'bg-indigo-600 text-white ml-auto' 
        : 'bg-white mr-auto'
    } p-3 rounded-lg shadow-sm`}>
      <p className="text-sm break-words">{message.text}</p>
      <span className={`text-xs ${message.fromSelf ? 'text-indigo-200' : 'text-gray-400'} mt-1 block`}>
        {message.timestamp}
      </span>
    </div>
  </div>
));

const ChatHeader = React.memo(({ 
  selectedChat, 
  setSelectedChat, 
  showChat, 
  setShowChat, 
  notifications,
  typingUsers 
}) => (
  <div className="flex items-center justify-between p-4 bg-indigo-900 text-white rounded-t-lg">
    <div className="flex items-center space-x-2">
      {selectedChat ? (
        <>
          <button 
            onClick={() => setSelectedChat(null)}
            className="p-1 hover:bg-indigo-800 rounded-full transition-colors"
            aria-label="Back to chat list"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src={selectedChat.profilePic} 
              alt={selectedChat.name}
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
            <div className="flex flex-col">
              <span className="font-medium">{selectedChat.name}</span>
              {typingUsers[selectedChat.id] && (
                <span className="text-xs text-gray-300 animate-pulse">Typing...</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Chat Messages</span>
          {notifications > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications}
            </span>
          )}
        </>
      )}
    </div>
    <button 
      onClick={() => {
        setShowChat(!showChat);
        if (showChat) setSelectedChat(null);
      }}
      className="text-white hover:text-gray-200 p-1 hover:bg-indigo-800 rounded-full transition-colors"
      aria-label={showChat ? "Close chat" : "Open chat"}
    >
      {showChat ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
    </button>
  </div>
));

const FriendListItem = React.memo(({ chat, onlineUsers, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
  >
    <div className="relative">
      <img 
        src={chat.profilePic}
        alt={chat.name}
        className="w-12 h-12 rounded-full object-cover"
        loading="lazy"
      />
      {onlineUsers.includes(chat.id) && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <span className="font-medium text-gray-900 truncate">{chat.name}</span>
        <span className="text-xs text-gray-500">{chat.timestamp}</span>
      </div>
      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
    </div>
    {chat.unread > 0 && (
      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        {chat.unread}
      </span>
    )}
  </div>
));

const ChatWindow = ({ 
  showChat, 
  setShowChat, 
  selectedChat, 
  setSelectedChat,
  chatList,
  notifications,
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  // Di ChatWindow.jsx

  // Pindahkan semua yang dibutuhkan dari useSocket ke sini
  const { 
    socket, 
    isConnected,
    sendPrivateMessage,
    sendTypingIndicator,
    onlineUsers,
    typingUsers,
    messages,
    user  // Tambahkan user di sini
  } = useSocket();
  

  // Perbaikan sync messages dari context
  useEffect(() => {
    console.log('Current messages from context:', messages);
    console.log('Current chat messages state:', chatMessages);
  }, [messages, chatMessages]);

  // Perbaiki fungsi filter messages
  useEffect(() => {
    if (selectedChat && messages) {
      const relevantMessages = messages.filter(msg => {
        return (msg.from === selectedChat.id && msg.to === user?.userId) ||
               (msg.from === user?.userId && msg.to === selectedChat.id);
      });
      
      const formattedMessages = relevantMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        fromSelf: msg.from === user?.userId,
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }));
      
      console.log('Formatted messages:', formattedMessages);
      setChatMessages(formattedMessages);
    }
  }, [selectedChat, messages, user]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (showChat && selectedChat) {
      chatInputRef.current?.focus();
      scrollToBottom();
    }
  }, [showChat, selectedChat, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Perbaikan handling pengiriman pesan
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Debug untuk melihat data
    console.log('Send message data:', {
      message: chatMessage,
      selectedChat,
      isConnected,
      user
    });
  
    if (!chatMessage.trim()) return;
    
    if (!selectedChat) {
      console.error('No chat selected');
      return;
    }
  
    if (!isConnected) {
      console.error('Not connected to socket');
      return;
    }
  
    // Gunakan user yang sudah di-destructure dari useSocket di atas
    if (!user) {
      console.error('User not authenticated');
      return;
    }
  
    try {
      await sendPrivateMessage(selectedChat.id, chatMessage.trim());
      setChatMessage('');
      chatInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = useCallback(() => {
    if (selectedChat && isConnected) {
      sendTypingIndicator(selectedChat.id);
    }
  }, [selectedChat, isConnected, sendTypingIndicator]);

  useEffect(() => {
    console.log({
      selectedChat,
      user,
      messages,
      chatMessages,
      isConnected
    });
  }, [selectedChat, user, messages, chatMessages, isConnected]);

  return (
    <div 
      className={`fixed bottom-0 right-4 ${showChat ? 'w-96' : 'w-80'} bg-white rounded-t-lg shadow-2xl z-40 
                transition-all duration-300 flex flex-col`}
      style={{ height: showChat ? '600px' : 'auto' }}
    >
      <ChatHeader 
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        showChat={showChat}
        setShowChat={setShowChat}
        notifications={notifications}
        typingUsers={typingUsers}
      />

      {showChat && (
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            // Friend list view
            <div className="flex-1 overflow-y-auto divide-y scrollbar-thin scrollbar-thumb-gray-300">
              {chatList.map((chat) => (
                <FriendListItem 
                  key={chat.id}
                  chat={chat}
                  onlineUsers={onlineUsers}
                  onClick={() => setSelectedChat(chat)}
                />
              ))}
            </div>
          ) : (
            // Chat view
            <>
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {chatMessages.map((msg) => (
        <Message 
          key={msg.id} 
          message={msg}  // Pastikan struktur message sesuai
        />
      ))}
      <div ref={messagesEndRef} />
    </div>

              <div className="bg-white border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatMessage}
                    onChange={(e) => {
                      setChatMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !chatMessage.trim()}
                    className="p-2 bg-indigo-900 text-white rounded-full hover:bg-indigo-800 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">
                    Disconnected from chat server. Trying to reconnect...
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatWindow);
