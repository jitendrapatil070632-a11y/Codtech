import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InviteModal = ({ users, onInvite, onClose, currentRoom }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState(`Join me in ${currentRoom} chat!`);

  const handleInvite = () => {
    if (selectedUser) {
      onInvite(selectedUser, message);
      onClose();
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="invite-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Invite to Chat</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Select User:</label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="user-select"
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.room})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Invite Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your invite message..."
              className="invite-message"
              rows="3"
            />
          </div>
          
          <div className="modal-info">
            <p>📨 This will send an invite to join <strong>{currentRoom}</strong> chat.</p>
            <p>👥 {users.length} users available to invite.</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-invite"
            onClick={handleInvite}
            disabled={!selectedUser}
          >
            📩 Send Invite
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteModal;