import React, { useState, useEffect } from 'react';
import { ChevronLeft, MessageSquare, Send, X, ChevronUp } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext'; // Pastikan path sesuai

const ChatWindow = ({ 
  showChat, 
  setShowChat, 
  selectedChat, 
  setSelectedChat,
  chatList,
  chatMessages,
  chatMessage,
  setChatMessage,
  notifications,
  handleSendMessage,
  onlineUsers
}) => {
  // Tambahkan state untuk koneksi dan error
  const [isConnecting, setIsConnecting] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const { socket, isConnected } = useSocket(); // Gunakan useSocket hook

  // Effect untuk menghandle status koneksi
  useEffect(() => {
    if (!socket) {
      setIsConnecting(true);
      return;
    }

    setIsConnecting(false);

    socket.on('connect_error', (error) => {
      setSocketError('Failed to connect to chat server');
      setIsConnecting(false);
    });

    socket.on('connect', () => {
      setSocketError(null);
      setIsConnecting(false);
    });

    return () => {
      socket.off('connect_error');
      socket.off('connect');
    };
  }, [socket]);

  return (
    <div className={`fixed bottom-0 right-4 ${showChat ? 'w-96' : 'w-80'} bg-white rounded-t-lg shadow-2xl z-40 
                    transition-all duration-300 flex flex-col`}
         style={{ height: showChat ? '600px' : 'auto' }}
         data-testid="chat-window">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-indigo-900 text-white">
        <div className="flex items-center space-x-2">
          {selectedChat ? (
            <>
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-1 hover:bg-indigo-800 rounded-full transition-colors"
                data-testid="chat-back-button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <img 
                src={selectedChat.profilePic} 
                alt={selectedChat.name}
                className="w-8 h-8 rounded"
                data-testid="chat-profile-image"
              />
              <span className="font-medium" data-testid="chat-user-name">{selectedChat.name}</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Chat Messages</span>
              {notifications > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full" data-testid="chat-notification-badge">
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
          data-testid="chat-toggle-button"
        >
          {showChat ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
      </div>
 {isConnecting && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Connecting to chat...</span>
        </div>
      )}

      {socketError && (
        <div className="p-4 bg-red-50 text-red-600">
          {socketError}
        </div>
      )}

      {showChat && (
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            // Chat List View
            <div className="flex-1 overflow-y-auto divide-y" data-testid="chat-list">
            {chatList.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={chat.profilePic}
                    alt={chat.name}
                    className="w-12 h-12 rounded"
                  />
                  {onlineUsers.has(chat.id) && (
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
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full" data-testid={`unread-badge-${chat.id}`}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Individual Chat View
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" data-testid="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex space-x-3" data-testid={`chat-message-${msg.id}`}>
                    <img 
                      src={selectedChat.profilePic}
                      alt={selectedChat.name}
                      className="w-8 h-8 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{selectedChat.name}</span>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <p className="mt-1 text-gray-700 bg-white p-3 rounded-lg inline-block shadow-sm">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border-t p-4 mt-auto" data-testid="chat-input-container">
                <form onSubmit={handleSendMessage} className="flex space-x-2" data-testid="chat-message-form">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    data-testid="chat-message-input"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-900 text-white rounded-full hover:bg-indigo-800 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    data-testid="chat-send-button"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;