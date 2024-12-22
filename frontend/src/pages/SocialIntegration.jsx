import React, { useState } from 'react';
import { Share2, X, ChevronUp, MessageSquare, Send, Download, Check } from 'lucide-react';

const SocialIntegration = () => {
  const [email, setEmail] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [notifications] = useState(1);

  const activities = [
    {
      title: 'Reduce your carbon footprint by 5% in a week.',
      completed: false
    },
    {
      title: 'Log your activities daily for a week.',
      completed: false
    },
    {
      title: 'Use public transport, walk, or bike for a day.',
      completed: false
    }
  ];

  const socialPlatforms = [
    {
      name: 'Instagram',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
      class: 'hover:bg-pink-50'
    },
    {
      name: 'Facebook',
      icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
      class: 'hover:bg-blue-50'
    },
    {
      name: 'LinkedIn',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
      class: 'hover:bg-blue-50'
    }
  ];

  const shareOptions = [
    { 
      name: 'Instagram', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png'
    },
    { 
      name: 'WhatsApp', 
      color: 'bg-green-500',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png'
    },
    { 
      name: 'Facebook', 
      color: 'bg-blue-600',
      icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png'
    },
    { 
      name: 'TikTok', 
      color: 'bg-black',
      icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png'
    },
    { 
      name: 'Twitter', 
      color: 'bg-blue-400',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png'
    }
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'Citra',
      message: 'Hey!',
      timestamp: '2 min ago',
      avatar: '/api/placeholder/32/32'
    }
  ];

  const handleSendInvite = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setChatMessage('');
  };

  const ChatWindow = () => (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl z-40 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-900 to-blue-800 text-white">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Chat Messages</span>
          {notifications > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications}
            </span>
          )}
        </div>
        <button 
          onClick={() => setShowChat(!showChat)} 
          className="text-white hover:text-gray-200 transition-colors"
        >
          <ChevronUp className={`h-5 w-5 transform ${showChat ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {showChat && (
        <>
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex space-x-3">
                <img 
                  src={msg.avatar} 
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <p className="mt-1 text-gray-700 bg-gray-100 p-2 rounded-lg inline-block">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-900 text-white rounded-full hover:bg-indigo-800 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );

  const AchievementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Share Achievement</h2>
          <button 
            onClick={() => setShowAchievement(false)}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-center mb-8">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-400 to-blue-500 
                          rounded-xl flex items-center justify-center">
              <Check className="h-16 w-16 text-white" />
            </div>
          </div>
          <div className="text-sm text-gray-600">December 4, 2024</div>
          <div className="font-medium mt-2">You earned an achievement by</div>
          <div className="font-medium text-indigo-900 text-lg">
            Logging your first carbon emission activity
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Share Achievement</div>
          <div className="flex justify-center space-x-4">
            {shareOptions.map((platform) => (
              <button
                key={platform.name}
                className="group relative"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center
                               ${platform.color} transition-transform transform 
                               group-hover:scale-110 shadow-md`}>
                  <img 
                    src={platform.icon} 
                    alt={platform.name}
                    className="w-6 h-6 object-contain brightness-0 invert"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
          <button 
            onClick={() => setShowAchievement(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="share-achievement"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* First Achievement */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg 
                          border border-green-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <span className="text-gray-900 font-medium">
                  Log your first carbon emission activity
                </span>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
              <Download 
                className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer"
                data-testid="download-first-achievement"
              />
            </div>

            {/* Other activities */}
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg
                          border border-gray-100 shadow-sm hover:shadow-md transition-all"
                data-testid={`activity-${index}`}
              >
                <span className="text-gray-600">{activity.title}</span>
              </div>
            ))}
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 mt-4 font-medium
                         hover:underline transition-colors"
              data-testid="view-all-achievements"
            >
              View all
            </button>
          </div>
        </div>
      </div>

      {/* Add Friends Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">Add friends</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="example@.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400"
              data-testid="friend-email-input"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-indigo-500 shadow-md hover:shadow-lg"
              data-testid="send-invite-button"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Connect Social Media Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">Connect social media</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                className={`flex items-center space-x-3 px-6 py-3 border border-gray-200 rounded-lg 
                         ${platform.class} transition-all hover:shadow-md
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                data-testid={`connect-${platform.name.toLowerCase()}`}
              >
                <img 
                  src={platform.icon} 
                  alt={platform.name} 
                  className="w-5 h-5 object-contain"
                />
                <span className="font-medium text-gray-700">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChatWindow />
      {showAchievement && <AchievementModal />}
    </div>
  );
};

export default SocialIntegration;