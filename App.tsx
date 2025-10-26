
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageType, FunnelStep } from './types';
import { BOT_AVATAR, BOT_NAME, INITIAL_FUNNEL, YES_BRANCH, NO_BRANCH, MAIN_FUNNEL, NOTIFICATION_AUDIO, REDIRECT_URL } from './constants';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<FunnelStep[]>(INITIAL_FUNNEL);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const notificationRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const playNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const playAudio = useCallback((src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);
  
  const addMessage = useCallback((type: MessageType, from: 'bot' | 'user', content?: string, imageUrl?: string, audioUrl?: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type, from, content, imageUrl, audioUrl }]);
  }, []);


  const processStep = useCallback(() => {
    if (stepIndex >= currentFunnel.length) return;

    const step = currentFunnel[stepIndex];
    
    setTimeout(() => {
      setIsTyping(true);
      playNotification();

      setTimeout(() => {
        setIsTyping(false);
        let advanceStep = true;
        
        switch (step.type) {
          case MessageType.TEXT:
            addMessage(MessageType.TEXT, 'bot', step.content);
            break;
          case MessageType.IMAGE:
            addMessage(MessageType.IMAGE, 'bot', undefined, step.imageUrl);
            break;
          case MessageType.AUDIO:
             addMessage(MessageType.AUDIO, 'bot', undefined, undefined, step.audioUrl);
             if (step.audioUrl) playAudio(step.audioUrl);
            break;
          case MessageType.OPTIONS:
            setShowOptions(true);
            advanceStep = false;
            break;
          case MessageType.CTA:
            setShowCTA(true);
            addMessage(MessageType.CTA, 'bot', step.content);
            break;
          case MessageType.REDIRECT:
            window.location.href = REDIRECT_URL;
            advanceStep = false;
            break;
        }

        if (advanceStep) {
          setStepIndex(prev => prev + 1);
        }
      }, 1500); // Typing indicator duration
    }, step.delay * 1000);
  }, [stepIndex, currentFunnel, addMessage, playAudio, playNotification]);
  
  useEffect(() => {
    processStep();
  }, [stepIndex, currentFunnel, processStep]);

  const handleOptionClick = (option: 'yes' | 'no') => {
    setShowOptions(false);
    const userResponse = option === 'yes' ? 'SIM' : 'NÃO';
    addMessage(MessageType.USER_RESPONSE, 'user', userResponse);

    const nextFunnel = option === 'yes' ? [...YES_BRANCH, ...MAIN_FUNNEL] : [...NO_BRANCH, ...MAIN_FUNNEL];
    
    setTimeout(() => {
      setCurrentFunnel(nextFunnel);
      setStepIndex(0);
    }, 500);
  };

  const handleCTAClick = () => {
    window.location.href = REDIRECT_URL;
  }

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col font-sans" style={{ backgroundImage: "url('https://i.postimg.cc/tggRvL69/fundo-whats-app.png')" }}>
      <header className="bg-[#005E54] text-white p-3 flex items-center shadow-md fixed top-0 w-full z-10">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="w-10 h-10 rounded-full mr-3" />
        <div>
          <h1 className="font-semibold text-lg">{BOT_NAME}</h1>
          <p className="text-xs text-gray-200">online</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-20 pb-24">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onCtaClick={handleCTAClick} />
          ))}
          {isTyping && <TypingIndicator avatar={BOT_AVATAR} />}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-transparent p-2">
        <div className="max-w-3xl mx-auto">
          {showOptions && (
            <div className="flex justify-center gap-4">
              <button onClick={() => handleOptionClick('yes')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                SIM 👍
              </button>
              <button onClick={() => handleOptionClick('no')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                NÃO 👎
              </button>
            </div>
          )}
        </div>
      </footer>
      <audio ref={audioRef} style={{ display: 'none' }} />
      <audio ref={notificationRef} src={NOTIFICATION_AUDIO} style={{ display: 'none' }} preload="auto" />
    </div>
  );
};

export default App;
