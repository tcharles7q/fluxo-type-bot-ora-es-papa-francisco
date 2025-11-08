import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageType, FunnelStep } from './types';
import { BOT_AVATAR, BOT_NAME, INITIAL_FUNNEL, YES_BRANCH, NO_BRANCH, MAIN_FUNNEL, NOTIFICATION_AUDIO, REDIRECT_URL } from './constants';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import CookieConsent from './components/CookieConsent';

const META_PIXEL_ID = '1346056499414740';
const COOKIE_CONSENT_KEY = 'cookie_consent_status';

// Add fbq to the window interface for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

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
  const [waitingForAudioId, setWaitingForAudioId] = useState<number | null>(null);
  const [consentStatus, setConsentStatus] = useState<'granted' | 'denied' | 'pending'>('pending');

  const notificationRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // --- Cookie Consent & Meta Pixel Logic ---
  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent === 'granted') {
      setConsentStatus('granted');
      initializePixel();
    } else if (savedConsent === 'denied') {
      setConsentStatus('denied');
    }
  }, []);

  const initializePixel = () => {
    if (window.fbq) {
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }
  };
  
  const trackPixelEvent = useCallback((eventName: string, params = {}) => {
    if (consentStatus === 'granted' && window.fbq) {
      window.fbq('track', eventName, params);
    }
  }, [consentStatus]);

  const handleAcceptConsent = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
    setConsentStatus('granted');
    initializePixel();
  };

  const handleDeclineConsent = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'denied');
    setConsentStatus('denied');
  };
  // --- End of Consent & Pixel Logic ---

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
  }, [setMessages]);

  const advanceFunnel = useCallback(() => {
    setWaitingForAudioId(null);
    setStepIndex(prev => prev + 1);
  }, [setWaitingForAudioId, setStepIndex]);

  const handleAudioEnded = useCallback((messageId: number) => {
    if (messageId === waitingForAudioId) {
      advanceFunnel();
    }
  }, [waitingForAudioId, advanceFunnel]);

  // This single useEffect handles the entire funnel progression logic,
  // including delays, typing indicators, and message dispatching.
  // It replaces the previous combination of useCallback and useEffect to prevent
  // scheduling duplicate messages on re-renders and to ensure delays are respected.
  useEffect(() => {
    // Guard conditions to prevent running the funnel logic unnecessarily.
    if (!isChatStarted || currentFunnel.length === 0 || waitingForAudioId || stepIndex >= currentFunnel.length) {
      return;
    }

    const step = currentFunnel[stepIndex];
    const typingDuration = 1500; // ms
    const stepDelay = step.delay * 1000; // ms
    
    // Calculate timing: wait for (total delay - typing duration), then show typing indicator.
    const initialWait = Math.max(0, stepDelay - typingDuration);
    const typingTime = Math.min(stepDelay, typingDuration);

    let typingTimer: number;
    const mainTimer = setTimeout(() => {
      setIsTyping(true);
      playNotification();

      typingTimer = setTimeout(() => {
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
              setWaitingForAudioId(newMessage.id);
            }
            advanceStep = false; // Wait for audio to end
            break;
          case MessageType.OPTIONS:
            addMessage(MessageType.OPTIONS, 'bot');
            advanceStep = false; // Wait for user input
            break;
          case MessageType.CTA:
            addMessage(MessageType.CTA, 'bot', step.content);
            trackPixelEvent('ViewContent');
            advanceStep = false; // Wait for user click
            break;
          case MessageType.REDIRECT:
            window.location.href = REDIRECT_URL;
            advanceStep = false; // Stop execution
            break;
        }

        if (advanceStep) {
          setStepIndex(prev => prev + 1);
        }
      }, typingTime);
    }, initialWait);

    // Cleanup function to clear timeouts if the component re-renders or unmounts.
    // This is crucial to prevent duplicate messages.
    return () => {
      clearTimeout(mainTimer);
      clearTimeout(typingTimer);
    };
  }, [isChatStarted, stepIndex, currentFunnel, waitingForAudioId, addMessage, playNotification, trackPixelEvent]);

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
                  onEnded={() => handleAudioEnded(msg.id)}
                />
              );
           })}
          {isTyping && <TypingIndicator avatar={BOT_AVATAR} />}
          <div ref={chatEndRef} />
        </div>
      </main>

      <audio ref={notificationRef} src={NOTIFICATION_AUDIO} style={{ display: 'none' }} preload="auto" />
      {consentStatus === 'pending' && <CookieConsent onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />}
    </div>
  );
};

export default App;