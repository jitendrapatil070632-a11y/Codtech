import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/TypingIndicator.css';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="typing-indicator"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <div className="typing-content">
          <div className="typing-dots">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
          <div className="typing-text">
            {typingUsers.length === 1
              ? `${typingUsers[0].username} is typing...`
              : `${typingUsers.length} people are typing...`}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;