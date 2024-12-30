import React, { useState,useEffect } from 'react';
import { Share2, X, Download, Check, Link,LogOut } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { sendFriendRequest, getPendingRequests, respondToFriendRequest } from '../services/friendService';
import {useNotification} from '../components/NotificationContext';
import { useSocket } from '../contexts/SocketContext';
import { SocketProvider } from '../contexts/SocketContext';

const SocialIntegration = () => {
  const [email, setEmail] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [notifications] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [shareNotification, setShareNotification] = useState({ show: false, message: '' });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setNotification } = useNotification();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [friendsList, setFriendsList] = useState([]);
  const [messages, setMessages] = useState({});
  const [isConnecting, setIsConnecting] = useState(true);
  const [socketError, setSocketError] = useState(null);

  // connect social media state
  const [connectedAccounts, setConnectedAccounts] = useState({
    instagram: null,
    facebook: null,
    linkedin: null
  });
// Load data dari localStorage
useEffect(() => {
  const savedAccounts = localStorage.getItem('connectedSocialAccounts');
  if (savedAccounts) {
    setConnectedAccounts(JSON.parse(savedAccounts));
  }
}, []);

// Fungsi untuk handle Instagram login
const handleInstagramLogin = () => {
  const username = prompt('Masukkan username Instagram Anda (tanpa @):');
  if (username) {
    const updatedAccounts = {
      ...connectedAccounts,
      instagram: {
        username: username,
        connectedAt: new Date().toISOString()
      }
    };
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('connectedSocialAccounts', JSON.stringify(updatedAccounts));
    window.open(`https://instagram.com/${username}`, '_blank');
  }
};
// Fungsi untuk handle Facebook login
const handleFacebookLogin = () => { 
  const username = prompt('Masukkan username Facebook Anda (tanpa @):');
  if (username) {
    const updatedAccounts = {
      ...connectedAccounts,
      facebook: {
        username: username,
        connectedAt: new Date().toISOString()
      }
    };
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('connectedSocialAccounts', JSON.stringify(updatedAccounts));
    window.open(`https://www.facebook.com/${username}`, '_blank');
  }
};
// Fungsi untuk handle LinkedIn login
const handleLinkedInLogin = () => {
  const username = prompt('Masukkan username LinkedIn Anda (tanpa @):');
  if (username) {
    const updatedAccounts = {
      ...connectedAccounts,
      linkedin: {
        username: username,
        connectedAt: new Date().toISOString()
      }
    };
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('connectedSocialAccounts', JSON.stringify(updatedAccounts));
    window.open(`https://www.linkedin.com/in/${username}`, '_blank');
  }
};

// Fungsi untuk disconnect account
const handleDisconnectAccount = (platform) => {
  const updatedAccounts = {
    ...connectedAccounts,
    [platform]: null
  };
  setConnectedAccounts(updatedAccounts);
  localStorage.setItem('connectedSocialAccounts', JSON.stringify(updatedAccounts));
};

const getFriendsList = async () => {
  try {
    const response = await fetch('/api/friends/list', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    // Transform data teman menjadi format yang sesuai untuk chat
    const formattedFriends = data.friends.map(friend => ({
      id: friend._id,
      name: friend.username,
      lastMessage: '', // Akan diupdate saat ada pesan
      timestamp: '', // Akan diupdate saat ada pesan
      unread: 0,
      profilePic: friend.profilePic || '/src/assets/default-avatar.png'
    }));
    
    setFriendsList(formattedFriends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    setError('Failed to load friends list');
  }
};

useEffect(() => {
  getFriendsList();
}, []);

useEffect(() => {
  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingRequests();
      setPendingRequests(response.requests || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load pending requests:', err);
    } finally {
      setLoading(false);
    }
  };
  
  loadPendingRequests();
  
  // Refresh setiap 30 detik
  const interval = setInterval(loadPendingRequests, 30000);
  return () => clearInterval(interval);
}, []);

const handleRespondToRequest = async (requestId, status) => {
  try {
    const response = await fetch(`/api/friends/request/${requestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }

    // Refresh friend requests
    const updatedRequests = await getPendingRequests();
    setPendingRequests(updatedRequests.requests || []);
    
    // Refresh friends list jika request diterima
    if (status === 'accepted') {
      getFriendsList();
    }
    
    setNotification({
      type: 'success',
      message: data.message || `Friend request ${status} successfully`
    });
  } catch (error) {
    setNotification({
      type: 'error',
      message: error.message || `Failed to ${status} friend request`
    });
  }
};


  // Achievement data yang akan dishare
  const achievementData = {
    title: "Achievement Unlocked!",
    description: "Logging your first carbon emission activity",
    date: "December 4, 2024",
    shareUrl: window.location.href
  };

  // const chatList = [
  //   {
  //     id: 1,
  //     name: 'Citra Azrill Andriana',
  //     lastMessage: 'Hey!',
  //     timestamp: '2 min ago',
  //     unread: 1,
  //     profilePic: '/src/assets/Profile.png'
  //   },
  //   {
  //     id: 2,
  //     name: 'Sri Cantik',
  //     lastMessage: 'How are you?',
  //     timestamp: '5 min ago',
  //     unread: 0,
  //     profilePic: '/src/assets/Profile4.png'
  //   }
  // ];

  // const chatMessages = [
  //   {
  //     id: 1,
  //     senderId: 1,
  //     text: 'Hey!',
  //     timestamp: '2 min ago'
  //   }
  // ];

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
      class: 'hover:bg-pink-50',
      connectHandler: handleInstagramLogin,
    },
    {
      name: 'Facebook',
      icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
      class: 'hover:bg-blue-50',
      connectHandler: handleFacebookLogin,
    },
    {
      name: 'LinkedIn',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
      class: 'hover:bg-blue-50',
      connectHandler: handleLinkedInLogin,
    }
  ];

  const shareOptions = [
    { 
      name: 'Instagram', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
      shareText: `🌟 Achievement Unlocked! 🌟\n\nI just earned an achievement for logging my first carbon emission activity!\n\nJoin me in making a difference! 🌱\n\n#Sustainability #CarbonFootprint`,
      shareUrl: 'instagram://story-camera'
    },
    { 
      name: 'WhatsApp', 
      color: 'bg-green-500',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      shareText: `🌟 Achievement Unlocked! 🌟\n\nI just earned an achievement for logging my first carbon emission activity! Check it out:`,
      shareUrl: 'whatsapp://send'
    },
    { 
      name: 'Facebook', 
      color: 'bg-blue-600',
      icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
      shareText: 'I just earned an achievement for making a positive environmental impact!',
      shareUrl: 'https://www.facebook.com/sharer/sharer.php'
    },
    { 
      name: 'TikTok', 
      color: 'bg-black',
      icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
      shareText: '🌟 Green Achievement Unlocked! 🌍 #Sustainability #Environment',
      shareUrl: 'https://www.tiktok.com/upload'
    },
    { 
      name: 'Twitter', 
      color: 'bg-blue-400',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
      shareText: '🌟 Just unlocked a new achievement! Logged my first carbon emission activity and taking steps towards a sustainable future. Join me! 🌱 #Sustainability',
      shareUrl: 'https://twitter.com/intent/tweet'
    }
  ];

  const handleShare = async (platform) => {
    setIsSharing(true);
    try {
      const shareText = platform.shareText;
      const shareUrl = achievementData.shareUrl;
      
      switch (platform.name) {
        case 'WhatsApp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
          
        case 'Facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
          
        case 'Twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
          
        case 'Instagram':
          alert('To share on Instagram:\n1. Screenshot your achievement\n2. Open Instagram\n3. Create a new post or story with the screenshot');
          break;
          
        case 'TikTok':
          alert('To share on TikTok:\n1. Screenshot your achievement\n2. Open TikTok\n3. Create a new video showing your achievement');
          break;
          
        default:
          console.error('Platform not supported');
      }
      
      showShareNotification(platform.name, true);
    } catch (error) {
      console.error('Error sharing:', error);
      showShareNotification(platform.name, false);
    } finally {
      setIsSharing(false);
    }
  };

  const showShareNotification = (platformName, success) => {
    setShareNotification({
      show: true,
      message: success 
        ? `Successfully shared to ${platformName}!` 
        : `Failed to share to ${platformName}. Please try again.`
    });

    setTimeout(() => {
      setShareNotification({ show: false, message: '' });
    }, 3000);
  };
// Update handleSendInvite
const handleSendInvite = async (e) => {
  e.preventDefault();
  if (!email) return;
  
  setIsSubmitting(true);
  try {
    await sendFriendRequest(email);
    setNotification({
      type: 'success',
      message: 'Friend request sent successfully!'
    });
    setEmail('');
    
    // Refresh pending requests
    const updatedRequests = await getPendingRequests();
    setPendingRequests(updatedRequests.requests || []);
  } catch (error) {
    setNotification({
      type: 'error',
      message: error.message || 'Error sending friend request'
    });
  } finally {
    setIsSubmitting(false);
  }
};

useEffect(() => {
  if (!socket) return;

  socket.on('connect', () => {
    setIsConnecting(false);
    setSocketError(null);
  });

  socket.on('connect_error', (error) => {
    setIsConnecting(false);
    setSocketError('Failed to connect to chat server');
    console.error('Socket connection error:', error);
  });

  return () => {
    socket.off('connect');
    socket.off('connect_error');
  };
}, [socket]);

useEffect(() => {
  if (!socket) return;

  socket.on('private message', ({ content, from, timestamp }) => {
    // Update messages
    setMessages(prev => ({
      ...prev,
      [from]: [...(prev[from] || []), { content, from, timestamp }]
    }));
    
    // Update friendsList dengan pesan terakhir
    setFriendsList(prev => prev.map(friend => {
      if (friend.id === from) {
        return {
          ...friend,
          lastMessage: content,
          timestamp: new Date(timestamp).toLocaleTimeString(),
          unread: selectedChat?.id !== from ? (friend.unread || 0) + 1 : 0
        };
      }
      return friend;
    }));
  });

  return () => {
    socket.off('private message');
  };
}, [socket, selectedChat]);


// Update handleSendMessage:
const handleSendMessage = (e) => {
  e.preventDefault();
  if (!socket || !chatMessage.trim() || !selectedChat) return;

  const timestamp = new Date().toISOString();
  const messageData = {
    content: chatMessage,
    to: selectedChat.id,
    from: socket.id,
    timestamp
  };

  socket.emit('private message', messageData);

  // Update messages
  setMessages(prev => ({
    ...prev,
    [selectedChat.id]: [...(prev[selectedChat.id] || []), {
      content: chatMessage,
      from: socket.id,
      timestamp
    }]
  }));

  // Update friendsList dengan pesan terakhir
  setFriendsList(prev => prev.map(friend => {
    if (friend.id === selectedChat.id) {
      return {
        ...friend,
        lastMessage: chatMessage,
        timestamp: new Date(timestamp).toLocaleTimeString()
      };
    }
    return friend;
  }));

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
          <div className="text-sm text-gray-600">{achievementData.date}</div>
          <div className="font-medium mt-2">You earned an achievement by</div>
          <div className="font-medium text-indigo-900 text-lg">
            {achievementData.description}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Share Achievement</div>
          <div className="flex justify-center space-x-4">
            {shareOptions.map((platform) => (
              <button
                key={platform.name}
                className="group relative"
                onClick={() => handleShare(platform)}
                disabled={isSharing}
                data-testid={`share-${platform.name.toLowerCase()}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center
                             ${platform.color} transition-transform transform 
                             ${isSharing ? 'opacity-50' : 'group-hover:scale-110'} 
                             shadow-md cursor-pointer`}>
                  {isSharing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                  ) : (
                    <img 
                      src={platform.icon} 
                      alt={platform.name}
                      className="w-6 h-6 object-contain brightness-0 invert"
                    />
                  )}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                              text-xs text-gray-600 whitespace-nowrap">
                  {platform.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Copy Link Button */}
        <div className="mt-12">
          <button
            onClick={() => {
              navigator.clipboard.writeText(achievementData.shareUrl);
              showShareNotification('Clipboard', true);
            }}
            className="w-full py-2 px-4 border border-gray-200 rounded-lg text-gray-700
                     hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Link className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>
      
      {/* Notification Toast */}
      {shareNotification.show && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg 
                      shadow-lg transition-opacity duration-300">
          {shareNotification.message}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8" data-testid="social-integration-page">
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
  disabled={isSubmitting || !email}
  className={`px-6 py-2 ${
    isSubmitting || !email 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-indigo-900 hover:bg-indigo-800'
  } text-white rounded-lg transition-colors focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg`}
  data-testid="send-invite-button"
>
  {isSubmitting ? 'Sending...' : 'Send'}
</button>
          </form>
          {/* info pending requests */}
          <div className="mt-6">
  <h3 className="text-lg font-medium mb-4">Pending Friend Requests</h3>
  {loading ? (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
    </div>
  ) : error ? (
    <div className="text-red-500 p-4 bg-red-50 rounded-lg">
      <p>Error: {error}</p>
    </div>
  ) : pendingRequests.length === 0 ? (
    <p className="text-gray-500">No pending friend requests</p>
  ) : (
    <div className="space-y-4">
{pendingRequests.map((request) => (
  <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium">
        {request.sender?.username || request.sender?.email || 'Unknown User'}
      </p>
      <p className="text-sm text-gray-500">
        Sent {new Date(request.createdAt).toLocaleDateString()}
      </p>
    </div>
    <div className="space-x-2">
      <button
        onClick={() => handleRespondToRequest(request._id, 'accepted')}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={() => handleRespondToRequest(request._id, 'rejected')}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Reject
      </button>
    </div>
  </div>
))}
    </div>
  )}
</div>
        </div>
      </div>

      {/* Connect Social Media Section */}
      <div className="max-w-4xl mx-auto p-4 md:p-0">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">Connect social media</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {socialPlatforms.map((platform) => {
              const isConnected = connectedAccounts[platform.name.toLowerCase()];
              
              return (
                <div key={platform.name} className="relative">
                  <button
                    onClick={isConnected ? 
                      () => handleDisconnectAccount(platform.name.toLowerCase()) : 
                      platform.connectHandler}
                    className={`w-full flex items-center justify-center space-x-3 px-4 py-3 
                             border border-gray-200 rounded-lg ${platform.hoverColor} 
                             transition-all hover:shadow-md`}
                  >
                    <img 
                      src={platform.icon} 
                      alt={platform.name} 
                      className="w-5 h-5 object-contain"
                    />
                    <span className="font-medium text-gray-700">
                      {isConnected ? (
                        <div className="flex items-center space-x-2">
                          <span>@{connectedAccounts[platform.name.toLowerCase()].username}</span>
                          <LogOut className="h-4 w-4 text-gray-500" />
                        </div>
                      ) : (
                        `Connect ${platform.name}`
                      )}
                    </span>
                  </button>
                  
                  {isConnected && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Connected as @{connectedAccounts[platform.name.toLowerCase()].username}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
      
    <SocketProvider>
<ChatWindow 
  showChat={showChat}
  setShowChat={setShowChat}
  selectedChat={selectedChat}
  setSelectedChat={setSelectedChat}
  chatList={friendsList} // Gunakan friendsList sebagai gantinya
  chatMessages={messages[selectedChat?.id] || []}
  chatMessage={chatMessage}
  setChatMessage={setChatMessage}
  notifications={notifications}
  handleSendMessage={handleSendMessage}
/>

      </SocketProvider>
      
      {showAchievement && <AchievementModal />}
      
        {/* Notification Toast */}
        {shareNotification.show && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 
                      rounded-lg shadow-lg transition-opacity duration-300">
          {shareNotification.message}
        </div>
      )}
    </div>
  );
};

export default SocialIntegration;
