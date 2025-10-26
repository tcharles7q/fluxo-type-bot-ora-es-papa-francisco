
import React from 'react';

interface TypingIndicatorProps {
  avatar: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatar }) => {
  return (
    <div className="flex items-end mb-4">
      <img src={avatar} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-2" />
      <div className="bg-white p-3 rounded-r-lg rounded-bl-lg shadow">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
