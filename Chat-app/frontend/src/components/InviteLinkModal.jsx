import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faLink, faClock, faUsers, faTrash } from '@fortawesome/free-solid-svg-icons';

const InviteLinkModal = ({ onGenerate, onClose, myInviteLinks, onRevoke }) => {
  const [expiresIn, setExpiresIn] = useState(24);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    onGenerate(expiresIn);
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        className="invite-link-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faLink} /> Invite Friends
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          {/* Generate New Link */}
          <div className="generate-section">
            <h4>Generate New Invite Link</h4>
            <div className="expiry-options">
              <label>Link Expires In:</label>
              <div className="expiry-buttons">
                {[1, 6, 12, 24, 48, 168].map(hours => (
                  <button
                    key={hours}
                    className={`expiry-btn ${expiresIn === hours ? 'active' : ''}`}
                    onClick={() => setExpiresIn(hours)}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            
            <button className="generate-btn" onClick={handleGenerate}>
              <FontAwesomeIcon icon={faLink} /> Generate Invite Link
            </button>
            
            <p className="info-text">
              <FontAwesomeIcon icon={faUsers} /> Each link can be used up to 5 times
            </p>
          </div>

          {/* Active Links */}
          {myInviteLinks.length > 0 && (
            <div className="active-links-section">
              <h4>Active Invite Links</h4>
              <div className="links-list">
                {myInviteLinks.map(link => (
                  <div key={link.token} className="link-card">
                    <div className="link-header">
                      <span className="link-room">{link.room} Room</span>
                      <div className="link-usage">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{link.uses}/{link.maxUses} uses</span>
                      </div>
                    </div>
                    
                    <div className="link-url">
                      <input
                        type="text"
                        value={link.url}
                        readOnly
                        className="url-input"
                      />
                      <button 
                        className="copy-btn"
                        onClick={() => handleCopy(link.url)}
                        title="Copy link"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    
                    <div className="link-footer">
                      <div className="link-info">
                        <div className="info-item">
                          <FontAwesomeIcon icon={faClock} />
                          <span>Expires: {formatDate(link.expiresAt)}</span>
                        </div>
                        <div className="info-item">
                          <span>Created: {formatDate(link.createdAt)}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="revoke-btn"
                        onClick={() => onRevoke(link.token)}
                        title="Revoke link"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Use */}
          <div className="instructions-section">
            <h4>How to Use Invite Links</h4>
            <div className="instructions">
              <div className="instruction">
                <span className="step">1</span>
                <p>Generate an invite link for your current chat room</p>
              </div>
              <div className="instruction">
                <span className="step">2</span>
                <p>Share the link with friends via WhatsApp, Email, or any messaging app</p>
              </div>
              <div className="instruction">
                <span className="step">3</span>
                <p>When friends click the link, they'll join your chat room automatically</p>
              </div>
              <div className="instruction">
                <span className="step">4</span>
                <p>You'll get notified when someone joins via your link</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteLinkModal;