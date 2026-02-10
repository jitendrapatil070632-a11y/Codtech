import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import TypingIndicator from './TypingIndicator';
import Notification from './Notification';
import AIBot from './AIBot';
import RoomSelector from './RoomSelector';
import InviteModal from './InviteModal';
import InviteLinkModal from './InviteLinkModal';
import InviteJoinModal from './InviteJoinModal';
import '../styles/ChatContainer.css';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showAIBot, setShowAIBot] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiResponses, setAiResponses] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [showInviteJoinModal, setShowInviteJoinModal] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const [myInviteLinks, setMyInviteLinks] = useState([]);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check for invite token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      setShowInviteJoinModal(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Generate user data
  const generateUser = () => {
    const avatars = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '🤵', '👸', '🦸'];
    const colors = ['#0084ff', '#ff6b6b', '#51cf66', '#ffd43b', '#9775fa', '#ff922b', '#20c997', '#f783ac', '#748ffc', '#63e6be'];
    const usernames = [
      'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Dakota', 'Peyton',
      'Skyler', 'Rowan', 'Sage', 'Finley', 'Hayden', 'Kai', 'River', 'Phoenix', 'Emerson', 'Blake'
    ];
    
    const username = usernames[Math.floor(Math.random() * usernames.length)] + 
                    Math.floor(Math.random() * 99);
    
    return {
      username,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      room: currentRoom
    };
  };

  // Join via invite link
  const joinViaInvite = (token, userData) => {
    socket.emit('join_via_invite', { token, userData });
  };

  // Generate invite link
  const generateInviteLink = (expiresIn = 24) => {
    socket.emit('generate_invite_link', { room: currentRoom, expiresIn });
  };

  // Get my invite links
  const getMyInviteLinks = () => {
    socket.emit('get_my_invite_links');
  };

  // Revoke invite link
  const revokeInviteLink = (token) => {
    socket.emit('revoke_invite_link', { token });
  };

  // AI Bot responses
  const getAIResponse = (message) => {
    const responses = [
      "Interesting! Tell me more about that. 🤔",
      "That's fascinating! From my perspective...",
      "I see what you're saying. Have you considered...",
      "Great point! Let me add to that...",
      "I understand. Here's something you might find helpful...",
      "Interesting perspective! Here's what I think...",
      "Thanks for sharing! Based on my analysis...",
      "I appreciate your input. Let me provide some insights...",
      "That's a valid point! Here's additional information...",
      "I'm processing your message... Here are my thoughts:"
    ];
    
    return `${responses[Math.floor(Math.random() * responses.length)]}`;
  };

  // Simulate AI typing
  const simulateAITyping = (callback) => {
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      callback();
    }, 1500 + Math.random() * 2000);
  };

  // Add AI message
  const addAIMessage = (text) => {
    const aiMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: 'ai-bot',
      username: 'AURA.AI',
      avatar: '🤖',
      color: '#00a884',
      text: text,
      timestamp: new Date(),
      type: 'text',
      status: 'delivered',
      isAI: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
    scrollToBottom();
  };

  // Initialize connection
  useEffect(() => {
    const userData = generateUser();
    setCurrentUser(userData);
    
    // Connect to socket
    socket.emit('user_join', userData);
    setIsConnected(true);

    // Welcome message after delay
    setTimeout(() => {
      if (aiResponses && showAIBot) {
        addAIMessage("👋 Hello! I'm AURA, your AI companion. Type a message to start chatting!");
      }
    }, 2000);

    // Socket event listeners
    socket.on('receive_message', (message) => {
      if (message.room === currentRoom) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // AI responds to messages
        if (message.userId !== socket.id && message.userId !== 'ai-bot' && aiResponses && showAIBot) {
          simulateAITyping(() => {
            addAIMessage(getAIResponse(message.text));
          });
        }
      }
    });

    socket.on('room_history', ({ room, messages: history }) => {
      if (room === currentRoom) {
        setMessages(history);
        scrollToBottom();
      }
    });

    socket.on('user_list', (userList) => {
      setUsers(userList.filter(user => user.room === currentRoom));
    });

    socket.on('user_joined', (user) => {
      if (user.room === currentRoom) {
        setUsers(prev => [...prev, user]);
        const viaText = user.viaInvite ? ' via invite link' : '';
        addNotification('join', `${user.username} joined the chat${viaText}`, '👋');
      }
    });

    socket.on('user_left', (user) => {
      if (user.room === currentRoom) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        addNotification('leave', `${user.username} left the chat`, '👋');
      }
    });

    socket.on('user_typing', (typingUser) => {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== typingUser.userId), typingUser]);
    });

    socket.on('user_stopped_typing', (userId) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socket.on('invite_link_generated', (data) => {
      addNotification('success', 'Invite link generated!', '🔗');
      setMyInviteLinks(prev => [...prev, data]);
      // Auto-copy to clipboard
      navigator.clipboard.writeText(data.url);
      addNotification('info', 'Link copied to clipboard!', '📋');
    });

    socket.on('my_invite_links', (links) => {
      setMyInviteLinks(links);
    });

    socket.on('invite_link_revoked', ({ token }) => {
      setMyInviteLinks(prev => prev.filter(link => link.token !== token));
      addNotification('info', 'Invite link revoked', '🗑️');
    });

    socket.on('friend_joined_via_invite', ({ friendName, token }) => {
      addNotification('success', `${friendName} joined via your invite link!`, '🎉');
    });

    socket.on('invite_error', ({ reason }) => {
      addNotification('error', `Invite error: ${reason}`, '❌');
    });

    // Load existing invite links
    getMyInviteLinks();

    // Cleanup
    return () => {
      socket.off('receive_message');
      socket.off('room_history');
      socket.off('user_list');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('invite_link_generated');
      socket.off('my_invite_links');
      socket.off('invite_link_revoked');
      socket.off('friend_joined_via_invite');
      socket.off('invite_error');
    };
  }, [currentRoom, aiResponses, showAIBot]);

  // Switch room
  const switchRoom = (room) => {
    if (room === currentRoom) return;
    
    const oldRoom = currentRoom;
    setCurrentRoom(room);
    setMessages([]);
    setTypingUsers([]);
    
    socket.emit('switch_room', { oldRoom, newRoom: room });
    setCurrentUser(prev => ({ ...prev, room }));
    
    addNotification('info', `Switched to ${room} room`, '🔄');
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 100);
    }
  };

  // Add notification
  const addNotification = (type, message, icon) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, icon }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Send message
  const sendMessage = (text) => {
    if (text.trim() && currentUser) {
      socket.emit('send_message', { text });
      
      // Show message immediately
      const tempMessage = {
        id: 'temp-' + Date.now(),
        userId: socket.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        color: currentUser.color,
        text: text,
        timestamp: new Date(),
        type: 'text',
        room: currentRoom,
        status: 'sending'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();
      
      // AI response
      if (aiResponses && showAIBot && (text.includes('?') || Math.random() > 0.6)) {
        simulateAITyping(() => {
          addAIMessage(getAIResponse(text));
        });
      }
    }
  };

  // Send file
  const sendFile = (fileData) => {
    if (currentUser) {
      socket.emit('send_file', fileData);
      
      const fileMessage = {
        id: 'temp-' + Date.now(),
        userId: socket.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        color: currentUser.color,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileUrl: fileData.url,
        timestamp: new Date(),
        type: 'file',
        room: currentRoom,
        status: 'sending'
      };
      
      setMessages(prev => [...prev, fileMessage]);
      scrollToBottom();
    }
  };

  // Start typing indicator
  const startTyping = () => {
    socket.emit('typing_start');
  };

  // Stop typing indicator
  const stopTyping = () => {
    socket.emit('typing_stop');
  };

  // Toggle AI Bot
  const toggleAIBot = () => {
    setShowAIBot(!showAIBot);
    if (!showAIBot && aiResponses) {
      setTimeout(() => {
        addAIMessage("I'm here! What would you like to chat about? 🤖");
      }, 500);
    }
  };

  // Toggle AI Responses
  const toggleAIResponses = () => {
    setAiResponses(!aiResponses);
    addNotification(
      aiResponses ? 'warning' : 'success',
      aiResponses ? 'AI responses disabled' : 'AI responses enabled',
      '🤖'
    );
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    addNotification('info', 'Chat cleared', '🗑️');
  };

  return (
    <div className="chat-container">
      {/* Notifications */}
      <div className="notification-container">
        <AnimatePresence>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
              icon={notification.icon}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          users={users.filter(u => u.id !== socket.id)}
          onClose={() => setShowInviteModal(false)}
          currentRoom={currentRoom}
        />
      )}

      {/* Invite Link Modal */}
      {showInviteLinkModal && (
        <InviteLinkModal
          onGenerate={generateInviteLink}
          onClose={() => setShowInviteLinkModal(false)}
          myInviteLinks={myInviteLinks}
          onRevoke={revokeInviteLink}
        />
      )}

      {/* Invite Join Modal */}
      {showInviteJoinModal && (
        <InviteJoinModal
          inviteToken={inviteToken}
          onJoin={joinViaInvite}
          onClose={() => setShowInviteJoinModal(false)}
        />
      )}

      {/* Main Layout */}
      <div className="chat-layout">
        {/* Left Sidebar */}
        <div className="chat-sidebar">
          {/* Current User Info */}
          <div className="current-user-card">
            <div className="user-avatar" style={{ backgroundColor: currentUser?.color }}>
              <span className="avatar-text">{currentUser?.avatar}</span>
              <div className="online-status" />
            </div>
            <div className="user-info">
              <h4>{currentUser?.username}</h4>
              <p className="user-status">Online • {currentRoom}</p>
            </div>
          </div>

          {/* Invite Links Section */}
          <div className="invite-links-section">
            <div className="section-header">
              <h4>Invite Friends</h4>
            </div>
            <div className="invite-buttons">
              <button 
                className="invite-btn link-btn"
                onClick={() => setShowInviteLinkModal(true)}
                title="Generate invite link"
              >
                🔗 Invite Link
              </button>
              <button 
                className="invite-btn user-btn"
                onClick={() => setShowInviteModal(true)}
                title="Invite specific users"
              >
                👥 Invite Users
              </button>
            </div>
            
            {/* Active Links */}
            {myInviteLinks.length > 0 && (
              <div className="active-links">
                <h5>Active Invite Links</h5>
                <div className="links-list">
                  {myInviteLinks.map(link => (
                    <div key={link.token} className="link-item">
                      <div className="link-info">
                        <span className="link-room">{link.room}</span>
                        <span className="link-uses">{link.uses}/{link.maxUses} uses</span>
                      </div>
                      <button 
                        className="revoke-btn"
                        onClick={() => revokeInviteLink(link.token)}
                        title="Revoke link"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Selector */}
          <RoomSelector
            currentRoom={currentRoom}
            onSwitchRoom={switchRoom}
            rooms={[
              { id: 'general', name: 'General Chat', icon: '💬' },
              { id: 'tech', name: 'Technology', icon: '💻' },
              { id: 'gaming', name: 'Gaming', icon: '🎮' },
              { id: 'music', name: 'Music', icon: '🎵' },
              { id: 'movies', name: 'Movies', icon: '🎬' }
            ]}
          />

          {/* Online Users */}
          <div className="online-users-section">
            <div className="section-header">
              <h4>Online Users ({users.length})</h4>
            </div>
            <UserList 
              users={users}
              currentUser={currentUser}
            />
          </div>

          {/* AI Controls */}
          <div className="ai-controls">
            <div className="control-group">
              <button 
                className={`ai-toggle-btn ${showAIBot ? 'active' : ''}`}
                onClick={toggleAIBot}
              >
                <span className="toggle-icon">🤖</span>
                <span className="toggle-text">
                  {showAIBot ? 'AI Bot: ON' : 'AI Bot: OFF'}
                </span>
              </button>
              
              {showAIBot && (
                <button 
                  className={`ai-response-btn ${aiResponses ? 'active' : ''}`}
                  onClick={toggleAIResponses}
                >
                  <span className="response-icon">{aiResponses ? '✅' : '⏸️'}</span>
                  <span className="response-text">Responses</span>
                </button>
              )}
            </div>
            
            <button 
              className="clear-chat-btn"
              onClick={clearChat}
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="room-info">
              <span className="room-icon">💬</span>
              <div className="room-details">
                <h3>{currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)} Chat</h3>
                <p className="room-stats">
                  {users.length} online • {messages.length} messages
                </p>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="header-btn"
                onClick={() => setShowInviteLinkModal(true)}
                title="Invite friends"
              >
                🔗 Invite
              </button>
              <div className="connection-status">
                <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="messages-container"
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">👋</div>
                <h3>Welcome to {currentRoom} Chat!</h3>
                <p>Start chatting or invite friends to join using the invite button.</p>
                <div className="welcome-tips">
                  <span>🔗 Tip: Generate invite links to share with friends</span>
                  <span>📁 Tip: Click + to send files and media</span>
                  <span>🤖 Tip: Enable AI bot for smart responses</span>
                </div>
              </div>
            )}

            {/* Messages List */}
            <MessageList 
              messages={messages}
              currentUser={currentUser}
              onReact={() => {}}
            />
            
            {/* AI Typing Indicator */}
            {aiTyping && (
              <div className="ai-typing-indicator">
                <div className="typing-avatar">🤖</div>
                <div className="typing-dots">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
                <span className="typing-text">AURA is typing...</span>
              </div>
            )}
            
            {/* User Typing Indicators */}
            <TypingIndicator typingUsers={typingUsers} />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <MessageInput 
              onSend={sendMessage}
              onFileSend={sendFile}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
            />
          </div>
        </div>

        {/* AI Bot Panel */}
        {showAIBot && (
          <div className="ai-bot-panel">
            <AIBot 
              onSend={sendMessage}
              isTyping={aiTyping}
              aiResponses={aiResponses}
              toggleAIResponses={toggleAIResponses}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;