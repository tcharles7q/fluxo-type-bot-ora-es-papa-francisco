import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageType, FunnelStep } from './types';
import { BOT_AVATAR, BOT_NAME, INITIAL_FUNNEL, YES_BRANCH, NO_BRANCH, MAIN_FUNNEL, NOTIFICATION_AUDIO, REDIRECT_URL } from './constants';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';

// Create initial messages for the static welcome screen
const initialMessages: Message[] = [
  {
    id: Date.now(),
    type: MessageType.AUDIO,
    from: 'bot',
    audioUrl: INITIAL_FUNNEL[0].audioUrl, // Assumes the first step is audio
  },
  {
    id: Date.now() + 1,
    type: MessageType.OPTIONS,
    from: 'bot',
  }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentFunnel, setCurrentFunnel] = useState<FunnelStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [autoplayAudioId, setAutoplayAudioId] = useState<number | null>(null);
  const [isChatStarted, setIsChatStarted] = useState(false);

  const notificationRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current && isChatStarted) {
      mainRef.current.scrollTop = 0;
    }
  }, [isChatStarted]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatStarted) {
      scrollToBottom();
    }
  }, [messages, isTyping, isChatStarted]);

  const playNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const addMessage = useCallback((type: MessageType, from: 'bot' | 'user', content?: string, imageUrl?: string, audioUrl?: string): Message => {
    const newMessage: Message = { id: Date.now() + Math.random(), type, from, content, imageUrl, audioUrl };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
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
            if (step.audioUrl) {
              const newMessage = addMessage(MessageType.AUDIO, 'bot', undefined, undefined, step.audioUrl);
              setAutoplayAudioId(newMessage.id);
            }
            break;
          case MessageType.OPTIONS:
            addMessage(MessageType.OPTIONS, 'bot');
            advanceStep = false;
            break;
          case MessageType.CTA:
            addMessage(MessageType.CTA, 'bot', step.content);
            advanceStep = false; // Pause the funnel until the user clicks
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
  }, [stepIndex, currentFunnel, addMessage, playNotification]);
  
  useEffect(() => {
    if (currentFunnel.length > 0) {
      processStep();
    }
  }, [stepIndex, currentFunnel, processStep]);

  const handleOptionClick = (option: 'yes' | 'no') => {
    setIsChatStarted(true);
    setMessages(prev => prev.filter(msg => msg.type !== MessageType.OPTIONS));
    const userResponse = option === 'yes' ? '✅ Sim, acredito' : '🤔 Ainda tenho dúvidas';
    addMessage(MessageType.USER_RESPONSE, 'user', userResponse);

    const nextFunnel = option === 'yes' ? [...YES_BRANCH, ...MAIN_FUNNEL] : [...NO_BRANCH, ...MAIN_FUNNEL];
    
    setTimeout(() => {
      setCurrentFunnel(nextFunnel);
      setStepIndex(0); // This will trigger the processStep useEffect
    }, 500);
  };

  const handleCTAClick = () => {
    const ctaMessage = messages.find(msg => msg.type === MessageType.CTA);
    
    setMessages(prev => prev.filter(msg => msg.type !== MessageType.CTA));

    if (ctaMessage?.content) {
      addMessage(MessageType.USER_RESPONSE, 'user', ctaMessage.content as string);
    }
    
    setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, 500);
  }

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col font-sans" style={{ backgroundImage: "url('https://i.postimg.cc/tggRvL69/fundo-whats-app.png')" }}>
      <header className="bg-[#005E54] text-white p-3 flex items-center shadow-md fixed top-0 w-full z-10">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="w-10 h-10 rounded-full mr-3" />
        <div>
          <h1 className="font-semibold text-lg">{BOT_NAME}</h1>
          <p className="text-xs text-gray-200">{isTyping ? 'digitando...' : 'online'}</p>
        </div>
      </header>

      <main
        ref={mainRef}
        className={`flex-1 pt-20 ${
          isChatStarted
            ? 'overflow-y-auto p-2 sm:p-4 pb-20'
            : 'flex flex-col justify-center p-4'
        }`}
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.map((msg) => {
              const shouldAutoplay = msg.type === MessageType.AUDIO && msg.id === autoplayAudioId;
              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onCtaClick={handleCTAClick}
                  onOptionClick={handleOptionClick}
                  autoplay={shouldAutoplay}
                />
              );
           })}
          {isTyping && <TypingIndicator avatar={BOT_AVATAR} />}
          <div ref={chatEndRef} />
        </div>
      </main>

      <audio ref={notificationRef} src={NOTIFICATION_AUDIO} style={{ display: 'none' }} preload="auto" />
    </div>
  );
};

export default App;