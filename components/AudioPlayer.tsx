import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  id: number;
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AUDIO_PLAY_EVENT = 'audio-player-play';

const VolumeIcon = ({ volume }: { volume: number }) => {
    if (volume === 0) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 4l-4-4" /></svg>;
    }
     if (volume < 0.5) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ id, src, onEnded, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const animationRef = useRef<number | null>(null);

  const whilePlaying = () => {
    if (audioRef.current && !audioRef.current.ended) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  };

  const play = () => {
    if (isPlaying) return;
    
    if (hasEnded) {
        setHasEnded(false);
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    }

    const event = new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id } });
    document.dispatchEvent(event);

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(whilePlaying);
      })
      .catch(e => {
        console.error("Audio play failed (this is expected on first load until user interaction):", e);
        setIsPlaying(false);
      });
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
    }
  };
  
  useEffect(() => {
    if (autoPlay) {
      // Small delay to allow component to mount and avoid race conditions.
      const timer = setTimeout(() => {
        play();
      }, 100);
      return () => clearTimeout(timer);
    }
    // The play function is not memoized and would cause this to re-run.
    // We only want this to run once based on the initial autoPlay prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const togglePlayPause = () => {
    isPlaying ? pause() : play();
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    
    const setAudioData = () => {
        if (audio.duration !== Infinity) {
          setDuration(audio.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setHasEnded(true);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (isFinite(audio.duration)) {
             setCurrentTime(audio.duration);
        }
        onEnded?.();
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('durationchange', setAudioData);
    audio.addEventListener('ended', handleEnded);

    const handleOtherPlayerPlay = (event: CustomEvent) => {
        if (event.detail.id !== id) pause();
    };
    document.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlayerPlay as EventListener);

    return () => {
      pause();
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('durationchange', setAudioData);
      audio.removeEventListener('ended', handleEnded);
      document.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlayerPlay as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onEnded]);

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        action();
    }
  };

  const changePlayerCurrentTime = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const barWidth = progressBar.clientWidth;
    const newTime = (clickPosition / barWidth) * duration;

    if (isFinite(newTime)) {
        if (hasEnded) setHasEnded(false);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const barColor = hasEnded ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="flex items-center w-full max-w-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={togglePlayPause}
        onKeyPress={(e) => handleKeyPress(e, togglePlayPause)}
        aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
        className="relative flex-shrink-0 mr-3 cursor-pointer h-10 w-10 flex items-center justify-center"
      >
        <div className={`absolute icon-transition ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={`absolute icon-transition ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.002v3.996a1 1 0 001.555.832l3.197-2.001a1 1 0 000-1.664l-3.197-1.999z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1">
        <div
          onClick={changePlayerCurrentTime}
          className="relative w-full h-1.5 bg-gray-300 rounded-full cursor-pointer group"
        >
          <div className={`absolute top-0 left-0 h-full ${barColor} rounded-full`} style={{ width: `${progress}%` }} />
          <div
            className={`absolute h-3 w-3 ${barColor} rounded-full -mt-1 transform transition-transform group-hover:scale-125`}
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="relative flex items-center ml-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsVolumeVisible(!isVolumeVisible)}
          onKeyPress={(e) => handleKeyPress(e, () => setIsVolumeVisible(!isVolumeVisible))}
          className="cursor-pointer"
          aria-label="Controle de volume"
        >
          <VolumeIcon volume={volume} />
        </div>
        {isVolumeVisible && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-lg shadow-lg">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-4 h-20 accent-green-500"
              style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' }}
              aria-orientation="vertical"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;