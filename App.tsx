import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageType, FunnelStep } from './types';
import { BOT_AVATAR, BOT_NAME, INITIAL_FUNNEL, YES_BRANCH, NO_BRANCH, MAIN_FUNNEL, NOTIFICATION_AUDIO, REDIRECT_URL, IMAGES_TO_PRELOAD } from './constants';
import ChatMessage from './components/ChatMessage';
import LoadingScreen from './components/LoadingScreen';
import { preloadAudio } from './audio';
import { preloadImage } from './images';

const META_PIXEL_ID = '1346056499414740';

// Add fbq to the window interface for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

// --- Preloading Logic ---
const allFunnelSteps = [...INITIAL_FUNNEL, ...YES_BRANCH, ...NO_BRANCH, ...MAIN_FUNNEL];
const uniqueAudioUrls = [...new Set(
  allFunnelSteps
    .filter(step => step.type === MessageType.AUDIO && step.audioUrl)
    .map(step => step.audioUrl as string)
)];
if (NOTIFICATION_AUDIO) {
    uniqueAudioUrls.push(NOTIFICATION_AUDIO);
}
// --- End of Preloading Logic ---

const initialMessages: Message[] = [
  {
    id: Date.now(),
    type: MessageType.AUDIO,
    from: 'bot',
    audioUrl: INITIAL_FUNNEL[0].audioUrl,
  },
  {
    id: Date.now() + 1,
    type: MessageType.OPTIONS,
    from: 'bot',
  }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFunnel, setCurrentFunnel] = useState<FunnelStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isChatStarted, setIsChatStarted] = useState(false);

  const notificationRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const preloadAssets = async () => {
      const audioPromises = uniqueAudioUrls.map(url => preloadAudio(url));
      const imagePromises = IMAGES_TO_PRELOAD.map(url => preloadImage(url));

      await Promise.allSettled([...audioPromises, ...imagePromises]);
      
      setTimeout(() => {
          setIsLoading(false);
      }, 500);
    };

    preloadAssets();
  }, []);

  const initializePixel = useCallback(() => {
    if (window.fbq) {
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }
  }, []);

  useEffect(() => {
    initializePixel();
  }, [initializePixel]);
  
  const trackPixelEvent = useCallback((eventName: string, params = {}) => {
    if (window.fbq) {
      window.fbq('track', eventName, params);
    }
  }, []);

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
  }, [messages, isChatStarted]);

  const playNotification = useCallback(() => {
    const audio = notificationRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const addMessage = useCallback((type: MessageType, from: 'bot' | 'user', content?: string, imageUrl?: string, audioUrl?: string): Message => {
    const newMessage: Message = { id: Date.now() + Math.random(), type, from, content, imageUrl, audioUrl };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, [setMessages]);

  const advanceFunnel = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!isChatStarted || currentFunnel.length === 0 || stepIndex >= currentFunnel.length) {
      return;
    }

    const step = currentFunnel[stepIndex];
    
    playNotification();
    let advanceImmediately = true;
    
    switch (step.type) {
      case MessageType.TEXT:
        addMessage(MessageType.TEXT, 'bot', step.content);
        break;
      case MessageType.IMAGE:
        addMessage(MessageType.IMAGE, 'bot', undefined, step.imageUrl);
        break;
      case MessageType.AUDIO:
        if (step.audioUrl) {
          addMessage(MessageType.AUDIO, 'bot', undefined, undefined, step.audioUrl);
        }
        advanceImmediately = false;
        break;
      case MessageType.OPTIONS:
        addMessage(MessageType.OPTIONS, 'bot');
        advanceImmediately = false;
        break;
      case MessageType.CTA:
        addMessage(MessageType.CTA, 'bot', step.content);
        trackPixelEvent('ViewContent');
        advanceImmediately = false;
        break;
      case MessageType.REDIRECT:
        window.location.href = REDIRECT_URL;
        advanceImmediately = false;
        break;
    }

    if (advanceImmediately) {
      advanceFunnel();
    }
  }, [isChatStarted, stepIndex, currentFunnel, addMessage, playNotification, trackPixelEvent, advanceFunnel]);

  const handleOptionClick = (option: 'yes' | 'no') => {
    setIsChatStarted(true);
    setMessages(prev => prev.filter(msg => msg.type !== MessageType.OPTIONS));
    const userResponse = option === 'yes' ? '✅ Sim, acredito' : '🤔 Ainda tenho dúvidas';
    addMessage(MessageType.USER_RESPONSE, 'user', userResponse);

    const nextFunnel = option === 'yes' ? [...YES_BRANCH, ...MAIN_FUNNEL] : [...NO_BRANCH, ...MAIN_FUNNEL];
    
    setTimeout(() => {
      setCurrentFunnel(nextFunnel);
      setStepIndex(0);
    }, 500);
  };

  const handleCTAClick = () => {
    const ctaMessage = messages.find(msg => msg.type === MessageType.CTA);
    
    trackPixelEvent('Lead');

    setMessages(prev => prev.filter(msg => msg.type !== MessageType.CTA));

    if (ctaMessage?.content) {
      addMessage(MessageType.USER_RESPONSE, 'user', ctaMessage.content as string);
    }
    
    setTimeout(advanceFunnel, 500);
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100" style={{ backgroundImage: "url('https://i.postimg.cc/tggRvL69/fundo-whats-app.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <header className="bg-[#005E54] text-white p-3 flex items-center shadow-md sticky top-0 z-10 animate-fade-in">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="w-10 h-10 rounded-full mr-3 border-2 border-white" />
        <div>
          <h1 className="text-lg font-bold">{BOT_NAME}</h1>
          <p className="text-sm opacity-90">online</p>
        </div>
      </header>

      <main ref={mainRef} className={`flex-1 overflow-y-auto p-4 space-y-4 ${isChatStarted ? 'animate-fade-in-up' : ''}`}>
        {messages.map((msg, index) => {
             const isLastMessage = index === messages.length - 1;
             const isBotAudio = msg.from === 'bot' && msg.type === MessageType.AUDIO;
             const isFunnelActive = currentFunnel.length > 0 && stepIndex < currentFunnel.length;

            return (
                <ChatMessage
                    key={msg.id}
                    message={msg}
                    onCtaClick={handleCTAClick}
                    onOptionClick={handleOptionClick}
                    isFirstMessage={index === 0 && msg.type === MessageType.AUDIO}
                    onEnded={isLastMessage && isBotAudio && isFunnelActive ? advanceFunnel : undefined}
                />
            );
        })}
        <div ref={chatEndRef} />
      </main>
      
      <audio ref={notificationRef} src={NOTIFICATION_AUDIO} preload="auto" />
    </div>
  );
};

export default App;