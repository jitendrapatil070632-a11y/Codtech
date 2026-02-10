import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import '../styles/UserList.css';

const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list-container">
      {/* Current User Info */}
      <motion.div 
        className="current-user-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="current-user-avatar">
          <div 
            className="user-avatar-icon"
            style={{ 
              backgroundColor: `${currentUser?.color}20`,
              borderColor: currentUser?.color
            }}
          >
            {currentUser?.avatar}
          </div>
          <div className="user-status online" />
        </div>
        <div className="current-user-info">
          <div className="user-name">
            {currentUser?.username}
            <span className="you-badge">YOU</span>
          </div>
          <div className="user-status-text">Online</div>
        </div>
      </motion.div>

      {/* Online Users Header */}
      <div className="users-header">
        <h3>Online Users ({users.length})</h3>
        <button className="mute-toggle" title="Toggle sounds">
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>
      </div>

      {/* Users List */}
      <div className="users-list">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              className="user-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="user-avatar">
                <div 
                  className="user-avatar-icon"
                  style={{ 
                    backgroundColor: `${user.color}20`,
                    borderColor: user.color
                  }}
                >
                  {user.avatar}
                </div>
                <div className="user-status online" />
              </div>
              
              <div className="user-info">
                <div className="user-name">
                  {user.username}
                  {user.id === currentUser?.id && (
                    <span className="you-badge">YOU</span>
                  )}
                </div>
                <div className="user-activity">
                  {user.id === currentUser?.id ? 'Typing...' : 'Active now'}
                </div>
              </div>

              {/* User Actions */}
              <div className="user-actions">
                <button className="user-action-btn" title="Mute user">
                  <FontAwesomeIcon icon={faVolumeMute} />
                </button>
                <button className="user-action-btn" title="Make admin">
                  <FontAwesomeIcon icon={faCrown} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <motion.div 
          className="empty-users"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">👤</div>
          <p>No other users online</p>
          <small>Invite friends to join!</small>
        </motion.div>
      )}

      {/* Room Info */}
      <div className="room-info">
        <div className="room-stat">
          <span className="stat-label">Messages Today:</span>
          <span className="stat-value">142</span>
        </div>
        <div className="room-stat">
          <span className="stat-label">Active Time:</span>
          <span className="stat-value">2h 15m</span>
        </div>
        <button className="invite-btn">
          Invite Friends
        </button>
      </div>
    </div>
  );
};

export default UserList;