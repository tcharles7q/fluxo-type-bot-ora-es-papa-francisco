import React, { useState } from 'react';
import { Message, MessageType } from '../types';
import { BOT_AVATAR } from '../constants';
import AudioPlayer from './AudioPlayer';

interface ChatMessageProps {
  message: Message;
  onCtaClick: () => void;
  onOptionClick: (option: 'yes' | 'no') => void;
  onEnded?: () => void;
  isFirstMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCtaClick, onOptionClick, onEnded, isFirstMessage = false }) => {
  const isBot = message.from === 'bot';

  if (message.type === MessageType.OPTIONS) {
    const handleKeyPress = (e: React.KeyboardEvent, option: 'yes' | 'no') => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOptionClick(option);
        }
    };
    return (
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-4 animate-fade-in">
        <div 
          role="button" 
          tabIndex={0} 
          onKeyPress={(e) => handleKeyPress(e, 'yes')} 
          onClick={() => onOptionClick('yes')} 
          className="bg-[#035d54] hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 w-full sm:w-auto text-center cursor-pointer"
        >
          ✅ Sim, acredito
        </div>
        <div 
          role="button" 
          tabIndex={0} 
          onKeyPress={(e) => handleKeyPress(e, 'no')} 
          onClick={() => onOptionClick('no')} 
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 w-full sm:w-auto text-center cursor-pointer"
        >
          🤔 Ainda tenho dúvidas
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.type) {
      case MessageType.IMAGE:
        const [isLoaded, setIsLoaded] = useState(false);
        return (
            <div className="relative rounded-lg overflow-hidden" style={{ minHeight: '150px' }}>
                <img
                    src={message.imageUrl}
                    alt="content"
                    onLoad={() => setIsLoaded(true)}
                    className={`rounded-lg max-w-full h-auto w-full transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                {!isLoaded && (
                    <div className="absolute inset-0 w-full h-full shimmer-bg rounded-lg"></div>
                )}
            </div>
        );
      case MessageType.AUDIO:
        return message.audioUrl ? <AudioPlayer id={message.id} src={message.audioUrl} onEnded={onEnded} autoPlay={isBot && !isFirstMessage} /> : null;
      case MessageType.CTA:
        return (
            <div 
              role="button"
              tabIndex={0}
              onClick={onCtaClick} 
              onKeyPress={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCtaClick();
                }
              }} 
              className="mt-2 w-full bg-[#035d54] text-white font-bold py-3 px-4 rounded-lg shadow-lg animate-pulse hover:bg-green-700 transition-transform transform hover:scale-105 text-center cursor-pointer">
                {/* FIX: Proactively handle content that can be a string or an array of strings. */}
                {Array.isArray(message.content) ? message.content.join(' ') : message.content}
            </div>
        );
      default:
        // FIX: Handle content that can be a string or an array of strings.
        // This resolves the error "Property 'replace' does not exist on type 'string[]'".
        const content = message.content;
        const html = content
          ? Array.isArray(content)
            ? content.join('<br />')
            : content.replace(/\n/g, '<br />')
          : '';
        return <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: html }}></p>;
    }
  };

  if (message.from === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-fade-in-right">
        <div className="bg-[#DCF8C6] text-black p-3 rounded-l-lg rounded-br-lg max-w-[85%] sm:max-w-sm shadow-sm">
          {/* FIX: Proactively handle content that can be a string or an array of strings. */}
          <p className="font-medium">{Array.isArray(message.content) ? message.content.join(' ') : message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end mb-4 animate-fade-in-left">
      <img src={BOT_AVATAR} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-2 self-start" />
      <div className={`bg-white p-3 rounded-r-lg rounded-bl-lg max-w-[85%] sm:max-w-md shadow-sm ${message.type === MessageType.CTA ? 'w-full' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;