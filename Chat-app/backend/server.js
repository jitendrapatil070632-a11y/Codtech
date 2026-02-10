const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users
const users = new Map();
const typingUsers = new Set();
const inviteLinks = new Map(); // Store invite links

// Room management
const rooms = {
  'general': {
    name: 'General Chat',
    users: new Set(),
    messages: []
  },
  'tech': {
    name: 'Technology',
    users: new Set(),
    messages: []
  },
  'gaming': {
    name: 'Gaming',
    users: new Set(),
    messages: []
  }
};

// Generate unique invite link
function generateInviteLink(userId, room = 'general', expiresIn = 24) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
  
  inviteLinks.set(token, {
    userId,
    room,
    createdAt: new Date(),
    expiresAt,
    uses: 0,
    maxUses: 5 // Maximum 5 uses per link
  });
  
  return token;
}

// Validate invite link
function validateInviteLink(token) {
  const invite = inviteLinks.get(token);
  if (!invite) return { valid: false, reason: 'Invalid link' };
  
  if (invite.expiresAt < new Date()) {
    inviteLinks.delete(token);
    return { valid: false, reason: 'Link expired' };
  }
  
  if (invite.uses >= invite.maxUses) {
    inviteLinks.delete(token);
    return { valid: false, reason: 'Link usage limit reached' };
  }
  
  return { valid: true, invite };
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle joining via invite link
  socket.on('join_via_invite', ({ token, userData }) => {
    const validation = validateInviteLink(token);
    
    if (!validation.valid) {
      socket.emit('invite_error', { reason: validation.reason });
      return;
    }
    
    const { invite } = validation;
    const { username, avatar, color } = userData;
    
    // Increment uses
    invite.uses++;
    
    // Store user data
    users.set(socket.id, {
      id: socket.id,
      username,
      avatar,
      color,
      room: invite.room,
      joinedAt: new Date(),
      isOnline: true,
      joinedVia: token
    });

    // Join room
    socket.join(invite.room);
    if (rooms[invite.room]) {
      rooms[invite.room].users.add(socket.id);
    }

    // Notify inviter
    const inviterSocket = Array.from(io.sockets.sockets.values())
      .find(s => s.id === invite.userId);
    
    if (inviterSocket) {
      inviterSocket.emit('friend_joined_via_invite', {
        friendName: username,
        token,
        timestamp: new Date()
      });
    }

    // Broadcast to room
    socket.to(invite.room).emit('user_joined', {
      id: socket.id,
      username,
      avatar,
      color,
      timestamp: new Date(),
      room: invite.room,
      viaInvite: true
    });

    // Send room data to new user
    const roomUsers = Array.from(users.values()).filter(u => u.room === invite.room);
    socket.emit('user_list', roomUsers);

    // Send welcome message
    socket.emit('receive_message', {
      id: Date.now().toString(),
      userId: 'system',
      username: 'System',
      avatar: '🤖',
      color: '#00a884',
      text: `Welcome to ${rooms[invite.room]?.name || invite.room}! You joined via invite link.`,
      timestamp: new Date(),
      type: 'system',
      room: invite.room
    });

    console.log(`${username} joined ${invite.room} via invite link`);
  });

  // User joins chat normally
  socket.on('user_join', (userData) => {
    const { username, avatar, color, room = 'general' } = userData;
    
    users.set(socket.id, {
      id: socket.id,
      username,
      avatar,
      color,
      room,
      joinedAt: new Date(),
      isOnline: true
    });

    socket.join(room);
    if (rooms[room]) {
      rooms[room].users.add(socket.id);
    }

    socket.to(room).emit('user_joined', {
      id: socket.id,
      username,
      avatar,
      color,
      timestamp: new Date(),
      room
    });

    const roomUsers = Array.from(users.values()).filter(u => u.room === room);
    socket.emit('user_list', roomUsers);

    if (rooms[room]) {
      socket.emit('room_history', {
        room,
        messages: rooms[room].messages.slice(-50)
      });
    }

    console.log(`${username} joined ${room}`);
  });

  // Generate invite link
  socket.on('generate_invite_link', ({ room = 'general', expiresIn = 24 }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const token = generateInviteLink(socket.id, room, expiresIn);
    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/invite/${token}`;
    
    socket.emit('invite_link_generated', {
      token,
      url: inviteUrl,
      room,
      expiresAt: inviteLinks.get(token).expiresAt,
      maxUses: 5
    });
    
    console.log(`Invite link generated for ${user.username}: ${token}`);
  });

  // Get active invite links
  socket.on('get_my_invite_links', () => {
    const user = users.get(socket.id);
    if (!user) return;

    const myLinks = [];
    for (const [token, invite] of inviteLinks.entries()) {
      if (invite.userId === socket.id) {
        myLinks.push({
          token,
          room: invite.room,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          uses: invite.uses,
          maxUses: invite.maxUses,
          url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/invite/${token}`
        });
      }
    }
    
    socket.emit('my_invite_links', myLinks);
  });

  // Revoke invite link
  socket.on('revoke_invite_link', ({ token }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const invite = inviteLinks.get(token);
    if (invite && invite.userId === socket.id) {
      inviteLinks.delete(token);
      socket.emit('invite_link_revoked', { token });
      console.log(`Invite link revoked by ${user.username}: ${token}`);
    }
  });

  // Handle messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: socket.id,
      username: user.username,
      avatar: user.avatar,
      color: user.color,
      text: messageData.text,
      timestamp: new Date(),
      type: 'text',
      room: user.room,
      status: 'delivered'
    };

    if (rooms[user.room]) {
      rooms[user.room].messages.push(message);
      if (rooms[user.room].messages.length > 100) {
        rooms[user.room].messages = rooms[user.room].messages.slice(-100);
      }
    }

    io.to(user.room).emit('receive_message', message);
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    const user = users.get(socket.id);
    if (!user) return;

    typingUsers.add(socket.id);
    socket.to(user.room).emit('user_typing', {
      userId: socket.id,
      username: user.username
    });
  });

  socket.on('typing_stop', () => {
    const user = users.get(socket.id);
    if (!user) return;

    typingUsers.delete(socket.id);
    socket.to(user.room).emit('user_stopped_typing', socket.id);
  });

  // Handle file sharing
  socket.on('send_file', (fileData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const fileMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: socket.id,
      username: user.username,
      avatar: user.avatar,
      color: user.color,
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type,
      fileUrl: fileData.url,
      timestamp: new Date(),
      type: 'file',
      room: user.room
    };

    if (rooms[user.room]) {
      rooms[user.room].messages.push(fileMessage);
    }

    io.to(user.room).emit('receive_message', fileMessage);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      typingUsers.delete(socket.id);
      
      if (rooms[user.room]) {
        rooms[user.room].users.delete(socket.id);
      }
      
      socket.to(user.room).emit('user_left', {
        id: socket.id,
        username: user.username,
        timestamp: new Date(),
        room: user.room
      });
      
      console.log(`User disconnected: ${user.username}`);
    }
  });

  // Handle room switching
  socket.on('switch_room', ({ oldRoom, newRoom }) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.leave(oldRoom);
    if (rooms[oldRoom]) {
      rooms[oldRoom].users.delete(socket.id);
    }

    socket.join(newRoom);
    user.room = newRoom;
    if (rooms[newRoom]) {
      rooms[newRoom].users.add(socket.id);
    }

    socket.to(oldRoom).emit('user_left', {
      id: socket.id,
      username: user.username,
      timestamp: new Date(),
      room: oldRoom
    });

    socket.to(newRoom).emit('user_joined', {
      id: socket.id,
      username: user.username,
      avatar: user.avatar,
      color: user.color,
      timestamp: new Date(),
      room: newRoom
    });

    const roomUsers = Array.from(users.values()).filter(u => u.room === newRoom);
    socket.emit('user_list', roomUsers);
    
    if (rooms[newRoom]) {
      socket.emit('room_history', {
        room: newRoom,
        messages: rooms[newRoom].messages.slice(-50)
      });
    }

    socket.emit('room_switched', {
      oldRoom,
      newRoom
    });
  });
});

// API Endpoints for invite links
app.get('/api/invite/validate/:token', (req, res) => {
  const validation = validateInviteLink(req.params.token);
  
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.reason
    });
  }
  
  res.json({
    success: true,
    invite: {
      room: validation.invite.room,
      createdAt: validation.invite.createdAt,
      expiresAt: validation.invite.expiresAt,
      uses: validation.invite.uses,
      maxUses: validation.invite.maxUses
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    users: users.size,
    activeInvites: inviteLinks.size,
    rooms: Object.keys(rooms).map(room => ({
      name: rooms[room].name,
      users: rooms[room].users.size,
      messages: rooms[room].messages.length
    }))
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 Invite system enabled`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});