// frontend/src/components/FriendsList.js
import React, { useState, useEffect } from 'react';
import { getFriendsList } from '../services/friendService'; // Import dari file service yang sudah ada

const FriendsList = ({ onSelectFriend, selectedFriend }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriendsList();
      setFriends(response.friends);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError(err.message || 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="friends-list-container">
      <h3 className="friends-list-title">Friends</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="friends-list">
        {friends.map((friend) => (
          <div
            key={friend._id}
            className={`friend-item ${selectedFriend?._id === friend._id ? 'selected' : ''}`}
            onClick={() => onSelectFriend(friend)}
          >
            <div className="friend-avatar">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.username} />
              ) : (
                <div className="avatar-placeholder">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="friend-info">
              <div className="friend-name">{friend.username}</div>
              <div className="friend-status">
                <span className={`status-dot ${friend.isOnline ? 'online' : 'offline'}`}></span>
                {friend.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
