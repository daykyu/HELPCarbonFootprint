import React, { useState } from 'react';
import { Share2, X, Download, Check } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const SocialIntegration = () => {
  const [email, setEmail] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [notifications] = useState(1);

  // Dummy data untuk chat list
  const chatList = [
    {
      id: 1,
      name: 'Citra Azrill Andriana',
      lastMessage: 'Hey!',
      timestamp: '2 min ago',
      unread: 1,
      profilePic: '/src/assets/Profile.png'
    },
    {
      id: 2,
      name: 'Sri Cantik',
      lastMessage: 'How are you?',
      timestamp: '5 min ago',
      unread: 0,
      profilePic: '/src/assets/Profile4.png'
    }
  ];

  const chatMessages = [
    {
      id: 1,
      senderId: 1,
      text: 'Hey!',
      timestamp: '2 min ago'
    }
  ];

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

  const handleSendInvite = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setChatMessage('');
  };

  const AchievementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="achievement-modal">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Share Achievement</h2>
          <button 
            onClick={() => setShowAchievement(false)}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="close-achievement-modal"
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
                data-testid={`share-${platform.name.toLowerCase()}`}
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8" data-testid="social-integration-page">
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
                          border border-green-100 shadow-sm hover:shadow-md transition-all"
                 data-testid="first-achievement">
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
      

      {/* Chat Window Component */}
      <ChatWindow 
        showChat={showChat}
        setShowChat={setShowChat}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chatList={chatList}
        chatMessages={chatMessages}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        notifications={notifications}
        handleSendMessage={handleSendMessage}
      />
      
      {/* Achievement Modal */}
      {showAchievement && <AchievementModal />}
    </div>
    
  );
};

export default SocialIntegration;