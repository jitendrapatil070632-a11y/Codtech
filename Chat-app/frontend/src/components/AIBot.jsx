import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faLightbulb, faMicrochip, faBrain, faRocket } from '@fortawesome/free-solid-svg-icons';

const AIBot = ({ onSend, isTyping, aiResponses, toggleAIResponses }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [aiMood, setAiMood] = useState('curious');

  const conversationStarters = [
    "Tell me about artificial intelligence 🤖",
    "What's the future of technology? 🚀",
    "How can AI help in daily life? 💡",
    "Discuss quantum computing with me ⚛️",
    "What are neural networks? 🧠",
    "Share futuristic tech predictions 🔮",
    "Explain blockchain technology 🔗",
    "Let's talk about space exploration 🌌",
    "How does machine learning work? 📊",
    "What is the singularity? ⚡"
  ];

  const aiMoods = [
    { id: 'curious', icon: '🤔', color: '#00f3ff', label: 'Curious' },
    { id: 'helpful', icon: '💡', color: '#00ff9d', label: 'Helpful' },
    { id: 'excited', icon: '🚀', color: '#ff00ff', label: 'Excited' },
    { id: 'analytical', icon: '🔍', color: '#9d4edd', label: 'Analytical' },
    { id: 'creative', icon: '🎨', color: '#ffd60a', label: 'Creative' }
  ];

  const aiFacts = [
    "I can process information at lightning speed ⚡",
    "My neural network has 1.2 trillion parameters 🧠",
    "I learn from every conversation I have 📚",
    "I can understand multiple languages simultaneously 🌐",
    "My responses are generated in real-time ⏱️"
  ];

  useEffect(() => {
    // Randomize suggestions
    const shuffled = [...conversationStarters]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    setSuggestions(shuffled);

    // Change AI mood periodically
    const moodInterval = setInterval(() => {
      const randomMood = aiMoods[Math.floor(Math.random() * aiMoods.length)];
      setAiMood(randomMood.id);
    }, 15000);

    return () => clearInterval(moodInterval);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    onSend(suggestion);
  };

  const getCurrentMood = () => {
    return aiMoods.find(mood => mood.id === aiMood) || aiMoods[0];
  };

  const currentMood = getCurrentMood();

  return (
    <motion.div 
      className="ai-bot-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* AI Bot Header */}
      <div className="ai-header">
        <motion.div 
          className="ai-avatar-container"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          <div 
            className="ai-avatar-glow"
            style={{ borderColor: currentMood.color }}
          >
            <div className="ai-avatar">
              <FontAwesomeIcon icon={faRobot} />
            </div>
          </div>
          <div className="ai-status">
            <div 
              className="ai-status-dot"
              style={{ backgroundColor: currentMood.color }}
            />
            <span className="ai-status-text">ACTIVE</span>
          </div>
        </motion.div>

        <div className="ai-info">
          <h3 className="ai-name">AURA <span className="ai-version">v2.5</span></h3>
          <p className="ai-description">Advanced Understanding & Response Assistant</p>
          
          <div className="ai-mood" style={{ color: currentMood.color }}>
            <span className="mood-icon">{currentMood.icon}</span>
            <span className="mood-label">{currentMood.label}</span>
          </div>
        </div>

        <div className="ai-stats">
          <div className="stat">
            <FontAwesomeIcon icon={faBrain} />
            <span className="stat-value">99.7%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <FontAwesomeIcon icon={faMicrochip} />
            <span className="stat-value">1.2T</span>
            <span className="stat-label">Params</span>
          </div>
        </div>
      </div>

      {/* AI Toggle Button */}
      <div className="ai-toggle-control">
        <button 
          className={`ai-response-toggle ${aiResponses ? 'active' : ''}`}
          onClick={toggleAIResponses}
        >
          <span className="toggle-icon">{aiResponses ? '✅' : '⏸️'}</span>
          <span className="toggle-text">
            AI Responses: {aiResponses ? 'ENABLED' : 'DISABLED'}
          </span>
          <span className="toggle-status" style={{ color: aiResponses ? '#00ff9d' : '#ff3366' }}>
            {aiResponses ? '●' : '●'}
          </span>
        </button>
      </div>

      {/* AI Features */}
      <div className="ai-features">
        <div className="feature">
          <div className="feature-icon">
            <FontAwesomeIcon icon={faLightbulb} />
          </div>
          <div className="feature-content">
            <h4>Smart Responses</h4>
            <p>Context-aware intelligent replies</p>
          </div>
        </div>
        
        <div className="feature">
          <div className="feature-icon">
            <FontAwesomeIcon icon={faRocket} />
          </div>
          <div className="feature-content">
            <h4>Real-time Learning</h4>
            <p>Improves with every conversation</p>
          </div>
        </div>
      </div>

      {/* Conversation Starters */}
      <div className="ai-suggestions">
        <h4>💬 Start a conversation:</h4>
        <div className="suggestions-grid">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Facts */}
      <div className="ai-facts">
        <h4>🤖 Did you know?</h4>
        <motion.div 
          className="fact-carousel"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {aiFacts.map((fact, index) => (
            <div key={index} className="fact-item">
              <div className="fact-icon">✨</div>
              <p className="fact-text">{fact}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* AI Status */}
      <div className="ai-status-indicator">
        <AnimatePresence mode="wait">
          {isTyping ? (
            <motion.div 
              key="typing"
              className="ai-typing-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="typing-animation">
                <div className="typing-bar" />
                <div className="typing-bar" />
                <div className="typing-bar" />
              </div>
              <span className="typing-text">Processing your message...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="ready"
              className="ai-ready-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ready-indicator">
                <div className="ready-dot" />
              </div>
              <span className="ready-text">Ready to assist you!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIBot;