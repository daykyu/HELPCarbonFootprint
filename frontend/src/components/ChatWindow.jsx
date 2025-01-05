import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, MessageSquare, Send, X, ChevronUp } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { validateMessage } from '../utils/messageValidator';

const ChatWindow = ({ 
  showChat, 
  setShowChat, 
  selectedChat, 
  setSelectedChat,
  chatList,
  notifications,
  messageError,
  setMessageError
}) => {
  const { 
    socket, 
    isConnected,
    sendPrivateMessage,
    sendTypingIndicator,
    onlineUsers,
    typingUsers,
    messages,
    user,
    unreadMessages,
    totalUnread,
    markMessageAsRead,
  } = useSocket();

  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Komponen Message
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

  // Komponen ChatHeader
  const ChatHeader = React.memo(({ 
    selectedChat, 
    setSelectedChat, 
    showChat, 
    setShowChat, 
    notifications,
    typingUsers,
    totalUnread 
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
                src="../public/user-286.svg"
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
            {!selectedChat && totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnread}
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

  // Komponen FriendListItem
  const FriendListItem = React.memo(({ chat, onlineUsers, onClick }) => (
    <div
      onClick={() => {
        onClick();
        markMessageAsRead(chat.id);
      }}
      className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="relative">
        <img 
          src="../public/user-286.svg" 
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
      {unreadMessages[chat.id] > 0 && (
        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          {unreadMessages[chat.id]}
        </span>
      )}
    </div>
  ));

  // Effect untuk mark as read saat chat dibuka
  useEffect(() => {
    if (selectedChat) {
      markMessageAsRead(selectedChat.id);
    }
  }, [selectedChat, markMessageAsRead]);

  // Effect untuk filter messages
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validasi input dasar
    if (!chatMessage.trim() || !selectedChat || !isConnected || !user) {
      return;
    }
  
    // Validasi kata-kata tidak pantas
    const validation = validateMessage(chatMessage.trim());
    
    if (!validation.isValid) {
      setMessageError(`Pesan mengandung kata tidak pantas: "${validation.invalidWords.join(', ')}". Silakan perbaiki dan kirim lagi.`);
      return;
    }
  
    try {
      // Kirim pesan hanya jika validasi berhasil
      const messageContent = chatMessage.trim();
      const success = await sendPrivateMessage(selectedChat.id, messageContent);
      
      if (success) {
        setChatMessage('');
        setMessageError('');
        chatInputRef.current?.focus();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageError('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };
  
  

  const handleTyping = useCallback(() => {
    if (selectedChat && isConnected) {
      sendTypingIndicator(selectedChat.id);
    }
  }, [selectedChat, isConnected, sendTypingIndicator]);

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
        totalUnread={totalUnread}
      />

      {showChat && (
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
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
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatMessages.map((msg) => (
                  <Message 
                    key={msg.id} 
                    message={msg}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t p-4">
  <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
    <div className="flex space-x-2">
      <input
        ref={chatInputRef}
        type="text"
        value={chatMessage}
        onChange={(e) => {
          const newValue = e.target.value;
          setChatMessage(newValue);
          
          // Reset error saat user mulai mengetik
          if (messageError) {
            // Cek apakah pesan baru masih mengandung kata tidak pantas
            const validation = validateMessage(newValue);
            if (validation.isValid) {
              setMessageError('');
            }
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
          }
        }}
        className={`w-full p-2 border rounded-lg ${
          messageError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        placeholder="Type a message..."
        disabled={!isConnected}
      />
      <button
        type="submit"
        disabled={!isConnected || !chatMessage.trim() || Boolean(messageError)}
        className={`p-2 ${
          !isConnected || !chatMessage.trim() || Boolean(messageError)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-900 hover:bg-indigo-800'
        } text-white rounded-full transition-colors`}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
    {messageError && (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
        {messageError}
      </div>
    )}
  </form>
</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatWindow);
