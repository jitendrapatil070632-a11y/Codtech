import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faImage, 
  faPaperclip,
  faSmile,
  faMicrophone,
  faPlus,
  faVideo,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import '../styles/MessageInput.css';

const MessageInput = ({ onSend, onFileSend, onTypingStart, onTypingStop }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // WhatsApp-style emojis
  const emojis = [
    '😀', '😂', '🥰', '😎', '🤩', '😜', '🤗', '👍', '👏', '🎉',
    '❤️', '🔥', '💯', '✨', '🌟', '💫', '💖', '💕', '😊', '🤔',
    '😴', '🥳', '😍', '🤣', '😇', '🥺', '😭', '😡', '🤯', '😱',
    '😎', '🥶', '🤠', '🤡', '👻', '💀', '👽', '🤖', '🎃', '🐶',
    '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'
  ];

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      onTypingStop();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTypingStart, onTypingStop]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      setIsTyping(false);
      onTypingStop();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Handle image upload
        const reader = new FileReader();
        reader.onload = (e) => {
          onFileSend({
            type: 'image',
            name: file.name,
            size: file.size,
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        onFileSend({
          type: 'file',
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file)
        });
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsRecording(true);
      // Start recording logic would go here
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording and send audio logic would go here
  };

  const handleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  return (
    <div className="whatsapp-input-container">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <motion.div 
          className="emoji-picker-whatsapp"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="emoji-picker-header">
            <h4>Emojis</h4>
            <button 
              className="close-emoji"
              onClick={() => setShowEmojiPicker(false)}
            >
              ✕
            </button>
          </div>
          <div className="emoji-grid-whatsapp">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-item-whatsapp"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* More Options Menu */}
      {showMoreOptions && (
        <motion.div 
          className="more-options-menu"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <button className="option-item" onClick={() => imageInputRef.current?.click()}>
            <FontAwesomeIcon icon={faImage} />
            <span>Photo & Video</span>
          </button>
          <button className="option-item" onClick={() => fileInputRef.current?.click()}>
            <FontAwesomeIcon icon={faPaperclip} />
            <span>Document</span>
          </button>
          <button className="option-item">
            <FontAwesomeIcon icon={faVideo} />
            <span>Video Call</span>
          </button>
          <button className="option-item">
            <FontAwesomeIcon icon={faMicrophone} />
            <span>Voice Message</span>
          </button>
        </motion.div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* WhatsApp-style Input Area */}
      <div className="whatsapp-input-wrapper">
        {/* Plus Button for More Options */}
        <button 
          className="input-btn plus-btn"
          onClick={handleMoreOptions}
          title="More options"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>

        {/* Message Input */}
        <div className="message-input-whatsapp">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="whatsapp-textarea"
            rows="1"
          />
        </div>

        {/* Right Side Buttons */}
        <div className="right-buttons">
          {/* Emoji Button */}
          {!message.trim() && (
            <button 
              className="input-btn emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Emoji"
            >
              <FontAwesomeIcon icon={faSmile} />
            </button>
          )}

          {/* Send/Recording Button */}
          {message.trim() ? (
            <button 
              className="input-btn send-btn"
              onClick={handleSend}
              title="Send"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          ) : (
            <button 
              className={`input-btn mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop recording' : 'Record voice'}
            >
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;