import React from 'react';
import { Message, MessageType } from '../types';
import { BOT_AVATAR } from '../constants';
import AudioPlayer from './AudioPlayer';

interface ChatMessageProps {
  message: Message;
  onCtaClick: () => void;
  onOptionClick: (option: 'yes' | 'no') => void;
  autoplay?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCtaClick, onOptionClick, autoplay = false }) => {
  const isBot = message.from === 'bot';

  if (message.type === MessageType.OPTIONS) {
    return (
      <div className="flex justify-center gap-4 my-4 animate-fade-in">
        <button onClick={() => onOptionClick('yes')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
          SIM 👍
        </button>
        <button onClick={() => onOptionClick('no')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
          NÃO 👎
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.type) {
      case MessageType.IMAGE:
        return <img src={message.imageUrl} alt="content" className="rounded-lg max-w-xs md:max-w-sm mt-2" />;
      case MessageType.AUDIO:
        return message.audioUrl ? <AudioPlayer id={message.id} src={message.audioUrl} autoplay={autoplay} /> : null;
      case MessageType.CTA:
        return (
            <button onClick={onCtaClick} className="mt-2 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg animate-pulse hover:bg-green-600 transition-transform transform hover:scale-105">
                {message.content}
            </button>
        );
      default:
        return <p className="text-gray-800">{message.content}</p>;
    }
  };

  if (message.from === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-[#DCF8C6] text-black p-3 rounded-l-lg rounded-br-lg max-w-[85%] sm:max-w-sm shadow">
          <p className="font-semibold">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end mb-4 animate-fade-in">
      <img src={BOT_AVATAR} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-2 self-start" />
      <div className={`bg-white p-3 rounded-r-lg rounded-bl-lg max-w-[85%] sm:max-w-md shadow ${message.type === MessageType.CTA ? 'w-full' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;