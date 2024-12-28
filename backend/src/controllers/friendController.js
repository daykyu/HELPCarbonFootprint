const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// backend/src/controllers/friendController.js
exports.sendFriendRequest = async (req, res) => {
    try {
      const { receiverEmail } = req.body;
      const senderId = req.userId;

      // Validasi input
      if (!receiverEmail) {
        return res.status(400).json({
          success: false,
          message: 'Receiver email is required'
        });
      }

      // Debug logs
      console.log('Processing friend request:');
      console.log('Sender ID:', senderId);
      console.log('Receiver Email:', receiverEmail);
    
      if (!senderId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request'
        });
      }
  
      // Cek apakah receiver ada
      const receiver = await User.findOne({ email: receiverEmail });
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'User with this email address not found'
        });
      }
  
      // Cek apakah mengirim request ke diri sendiri
      if (senderId === receiver._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot send friend request to yourself'
        });
      }
  
      // Cek apakah sudah berteman
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Sender not found'
        });
      }

      // Inisialisasi friends array jika belum ada
      if (!sender.friends) sender.friends = [];
      if (!receiver.friends) receiver.friends = [];

      // Cek pertemanan
      if (sender.friends.some(friendId => friendId.toString() === receiver._id.toString())) {
        return res.status(400).json({
          success: false,
          message: 'You are already friends with this user'
        });
      }
  
      // Cek existing requests di kedua arah
      const existingRequest = await FriendRequest.findOne({
        $or: [
          { sender: senderId, receiver: receiver._id, status: 'pending' },
          { sender: receiver._id, receiver: senderId, status: 'pending' }
        ]
      });
  
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'A friend request already exists between these users'
        });
      }
  
      // Buat friend request baru
      const friendRequest = new FriendRequest({
        sender: senderId,
        receiver: receiver._id
      });
  
      await friendRequest.save();

      // Debug log
      console.log('Friend request created successfully:', friendRequest);

      res.status(201).json({
        success: true,
        message: 'Friend request sent successfully'
      });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Internal server error'
        });
    }
};

// Update respondToFriendRequest untuk menangani array friends
exports.respondToFriendRequest = async (req, res) => {
    console.log('Request received:', {
        params: req.params,
        body: req.body,
        headers: req.headers
      });
    try {
      const { requestId } = req.params; // Ambil dari URL params
      const { status } = req.body;
      const userId = req.userId;
  
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
  
      const friendRequest = await FriendRequest.findById(requestId);
      if (!friendRequest) {
        return res.status(404).json({
          success: false,
          message: 'Friend request not found'
        });
      }
  
      // Verifikasi bahwa user adalah receiver dari request
      if (friendRequest.receiver.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to respond to this request'
        });
      }
  
      friendRequest.status = status;
      await friendRequest.save();
  
      if (status === 'accepted') {
        // Update friends array untuk kedua user
        await User.findByIdAndUpdate(friendRequest.sender, {
          $addToSet: { friends: friendRequest.receiver }
        });
        await User.findByIdAndUpdate(friendRequest.receiver, {
          $addToSet: { friends: friendRequest.sender }
        });
      }
  
      res.json({
        success: true,
        message: `Friend request ${status} successfully`
      });
    } catch (error) {
      console.error('Error in respondToFriendRequest:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

exports.getPendingRequests = async (req, res) => {
    try {
      // Tambahkan log untuk debugging
      console.log('User ID from token:', req.userId);
      
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found'
        });
      }
  
      const pendingRequests = await FriendRequest.find({
        receiver: req.userId,
        status: 'pending'
      }).populate('sender', 'name email');
  
      console.log('Pending requests found:', pendingRequests); // Debug log
  
      return res.status(200).json({
        success: true,
        requests: pendingRequests
      });
    } catch (error) {
      console.error('Error in getPendingRequests:', error); // Debug log
      return res.status(500).json({
        success: false,
        message: 'Error fetching pending requests',
        error: error.message
      });
    }
  };
  
