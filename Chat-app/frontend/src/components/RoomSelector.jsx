import React from 'react';
import { motion } from 'framer-motion';

const RoomSelector = ({ currentRoom, onSwitchRoom, rooms }) => {
  return (
    <div className="room-selector">
      <h4 className="section-title">Chat Rooms</h4>
      <div className="rooms-list">
        {rooms.map((room, index) => (
          <motion.button
            key={room.id}
            className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
            onClick={() => onSwitchRoom(room.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="room-icon">{room.icon}</span>
            <span className="room-name">{room.name}</span>
            {currentRoom === room.id && (
              <span className="active-indicator">●</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;