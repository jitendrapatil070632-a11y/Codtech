import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/Notification.css';

const Notification = ({ type, message, icon, onClose }) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    join: '👋',
    leave: '👋',
    message: '💬'
  };

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      layout
    >
      <div className="notification-icon">
        {icon || icons[type]}
      </div>
      <div className="notification-content">
        <div className="notification-message">
          {message}
        </div>
      </div>
      <button className="notification-close" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </motion.div>
  );
};

export default Notification;