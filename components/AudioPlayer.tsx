import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  id: number;
  src: string;
  autoplay?: boolean;
  onEnded?: () => void;
}

const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AUDIO_PLAY_EVENT = 'audio-player-play';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ id, src, autoplay = false, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const animationRef = useRef<number | null>(null);

  const play = () => {
    const event = new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id } });
    document.dispatchEvent(event);

    audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    setIsPlaying(true);
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
        if (audio.duration !== Infinity) {
            setDuration(audio.duration);
        }
    };

    const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
        setIsPlaying(false);
        // Reset current time to the beginning so the dot goes back
        setCurrentTime(0);
        onEnded?.();
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('durationchange', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    const handleOtherPlayerPlay = (event: CustomEvent) => {
        if (event.detail.id !== id) {
            pause();
        }
    };
    document.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlayerPlay as EventListener);

    return () => {
      pause(); // Clean up by pausing audio
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('durationchange', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      document.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlayerPlay as EventListener);
    };
  }, [id, onEnded]);

  useEffect(() => {
    if (autoplay) {
        setTimeout(() => {
          if (audioRef.current.paused) { // only play if not already playing
            play();
          }
        }, 100);
    }
  }, [autoplay]);


  const whilePlaying = () => {
    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(whilePlaying);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        action();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
        className="flex items-center w-full max-w-xs cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={togglePlayPause}
        onKeyPress={(e) => handleKeyPress(e, togglePlayPause)}
        aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
    >
      <div className="flex-shrink-0 mr-3">
        {isPlaying ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.002v3.996a1 1 0 001.555.832l3.197-2.001a1 1 0 000-1.664l-3.197-1.999z" clipRule="evenodd" />
           </svg>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative w-full h-1 bg-gray-300 rounded-full">
            <div className="absolute top-0 left-0 h-1 bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
            <div className="absolute h-3 w-3 bg-green-500 rounded-full -mt-1" style={{ left: `calc(${progress}% - 6px)` }}></div>
        </div>
        <div className="text-xs text-gray-500 self-end mt-1">
          {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;