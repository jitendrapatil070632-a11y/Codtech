import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faCheck, 
  faTimes,
  faHeart,
  faLaugh,
  faThumbsUp,
  faSadTear,
  faAngry
} from '@fortawesome/free-solid-svg-icons';
import '../styles/MessageList.css';

const MessageList = ({ messages, currentUser, onEdit, onDelete, onReact }) => {
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showReactions, setShowReactions] = useState(null);

  const reactions = [
    { icon: faThumbsUp, emoji: '👍', label: 'Like' },
    { icon: faHeart, emoji: '❤️', label: 'Love' },
    { icon: faLaugh, emoji: '😂', label: 'Haha' },
    { icon: faSadTear, emoji: '😢', label: 'Sad' },
    { icon: faAngry, emoji: '😠', label: 'Angry' },
  ];

  const handleEditStart = (message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
  };

  const handleEditSave = () => {
    if (editText.trim() && editingMessage) {
      onEdit(editingMessage, editText);
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="message-list">
      <AnimatePresence>
        {messages.map((message, index) => {
          const isOwnMessage = message.userId === currentUser?.id;
          const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId;
          
          return (
            <motion.div
              key={message.id}
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                y: 20 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -20 
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 
              }}
              className={`message-item ${isOwnMessage ? 'own' : 'other'} ${
                showAvatar ? 'with-avatar' : 'no-avatar'
              }`}
              layout
            >
              {/* Avatar */}
              {showAvatar && !isOwnMessage && (
                <motion.div 
                  className="message-avatar"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div 
                    className="avatar-icon"
                    style={{ 
                      backgroundColor: `${message.color}20`,
                      borderColor: message.color
                    }}
                  >
                    {message.avatar}
                  </div>
                </motion.div>
              )}

              {/* Message Content */}
              <div className="message-content">
                {/* Message Header */}
                {showAvatar && !isOwnMessage && (
                  <div className="message-header">
                    <span 
                      className="message-username"
                      style={{ color: message.color }}
                    >
                      {message.username}
                    </span>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message Body */}
                <div className="message-body">
                  {editingMessage === message.id ? (
                    <div className="edit-container">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={handleEditSave}
                          className="edit-btn save"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="edit-btn cancel"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  ) : message.type === 'file' ? (
                    <div className="file-message">
                      <div className="file-icon">📎</div>
                      <div className="file-info">
                        <div className="file-name">{message.fileName}</div>
                        <div className="file-size">
                          {(message.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <a 
                        href={message.fileUrl} 
                        download
                        className="file-download"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="message-text">
                        {message.text}
                        {message.edited && (
                          <span className="edited-badge">(edited)</span>
                        )}
                      </div>

                      {/* Message Actions */}
                      <div className="message-actions">
                        <button 
                          className="action-btn react-btn"
                          onClick={() => setShowReactions(
                            showReactions === message.id ? null : message.id
                          )}
                        >
                          😊
                        </button>
                        
                        {isOwnMessage && (
                          <>
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEditStart(message)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => onDelete(message.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Reactions Popup */}
                      {showReactions === message.id && (
                        <motion.div 
                          className="reactions-popup"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          {reactions.map((reaction) => (
                            <button
                              key={reaction.label}
                              className="reaction-btn"
                              onClick={() => {
                                onReact(message.id, reaction.emoji);
                                setShowReactions(null);
                              }}
                              title={reaction.label}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}

                      {/* Display Reactions */}
                      {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className="message-reactions">
                          {Object.entries(message.reactions).map(([emoji, users]) => (
                            <div key={emoji} className="reaction-item">
                              <span className="reaction-emoji">{emoji}</span>
                              <span className="reaction-count">{users.length}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Own message time */}
                {isOwnMessage && (
                  <div className="message-time own-time">
                    {formatTime(message.timestamp)}
                    {message.status && (
                      <span className={`message-status ${message.status}`}>
                        {message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;