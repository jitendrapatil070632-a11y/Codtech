import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InviteJoinModal = ({ inviteToken, onJoin, onClose }) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [isValidating, setIsValidating] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState('');

  const avatars = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '🤵', '👸', '🦸'];

  useEffect(() => {
    // Validate invite token
    const validateToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/invite/validate/${inviteToken}`);
        const data = await response.json();
        
        if (data.success) {
          setInviteInfo(data.invite);
          // Generate random username
          const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
          const randomName = names[Math.floor(Math.random() * names.length)] + 
                           Math.floor(Math.random() * 99);
          setUsername(randomName);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to validate invite link');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [inviteToken]);

  const handleJoin = () => {
    if (username.trim()) {
      onJoin(inviteToken, {
        username: username.trim(),
        avatar,
        color: '#0084ff'
      });
      onClose();
    }
  };

  if (isValidating) {
    return (
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="invite-join-modal">
          <div className="modal-header">
            <h3>Validating Invite Link...</h3>
          </div>
          <div className="modal-content loading">
            <div className="spinner"></div>
            <p>Checking invite link...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="invite-join-modal error"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>⚠️ Invalid Invite Link</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-content">
            <div className="error-icon">❌</div>
            <h4>This invite link is {error.toLowerCase()}</h4>
            <p>The invite link you're trying to use is no longer valid.</p>
            <p>Possible reasons:</p>
            <ul className="error-reasons">
              <li>Link has expired</li>
              <li>Link has been used too many times</li>
              <li>Link was revoked by the creator</li>
            </ul>
            <p>Ask your friend to send you a new invite link.</p>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="invite-join-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>🎉 You're Invited!</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <div className="invite-details">
            <div className="invite-icon">🔗</div>
            <div className="invite-info">
              <h4>Join Chat Room</h4>
              <p className="room-name">{inviteInfo?.room || 'Chat'} Room</p>
              <div className="invite-stats">
                <span>Expires: {new Date(inviteInfo?.expiresAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{inviteInfo?.uses || 0}/{inviteInfo?.maxUses || 5} uses</span>
              </div>
            </div>
          </div>

          <div className="join-form">
            <div className="form-group">
              <label>Choose Your Avatar:</label>
              <div className="avatar-selector">
                {avatars.map((av) => (
                  <button
                    key={av}
                    className={`avatar-option ${avatar === av ? 'selected' : ''}`}
                    onClick={() => setAvatar(av)}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Your Display Name:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="name-input"
                maxLength={20}
              />
              <p className="hint">This name will be visible to others in the chat</p>
            </div>
          </div>

          <div className="invite-message">
            <p>🎯 You're about to join a real-time chat room.</p>
            <p>💬 Chat with others instantly, share files, and have fun!</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleJoin}
            disabled={!username.trim()}
          >
            🚀 Join Chat Room
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteJoinModal;