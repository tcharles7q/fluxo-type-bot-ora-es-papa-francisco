import React, { useState, useRef, useEffect } from 'react';
import { BOT_AVATAR } from '../constants';

interface AudioPlayerProps {
  id: number;
  src: string;
  autoplay?: boolean;
}

const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AUDIO_PLAY_EVENT = 'audio-player-play';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ id, src, autoplay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const progressBarRef = useRef<HTMLInputElement>(null);
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
            if(progressBarRef.current) {
                progressBarRef.current.max = String(audio.duration);
            }
        }
    };

    const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
        setIsPlaying(false);
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
  }, [id]);

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
    if (progressBarRef.current) {
      progressBarRef.current.value = String(audioRef.current.currentTime);
      changePlayerCurrentTime();
    }
    animationRef.current = requestAnimationFrame(whilePlaying);
  };


  const changeRange = () => {
    if (progressBarRef.current) {
      audioRef.current.currentTime = Number(progressBarRef.current.value);
      changePlayerCurrentTime();
    }
  };

  const changePlayerCurrentTime = () => {
    if (progressBarRef.current && duration > 0) {
        const value = (Number(progressBarRef.current.value) / duration) * 100;
        progressBarRef.current.style.setProperty('--seek-before-width', `${value}%`);
        setCurrentTime(Number(progressBarRef.current.value));
    }
  };
  
  return (
    <div className="flex items-center bg-gray-100 p-2 rounded-lg w-full max-w-xs">
      <button onClick={togglePlayPause} className="p-2">
        {isPlaying ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center mx-2">
        <input 
            type="range"
            ref={progressBarRef}
            defaultValue="0"
            onChange={changeRange}
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{'--seek-before-width': `${(currentTime && duration > 0 ? (currentTime / duration) * 100 : 0)}%`} as React.CSSProperties}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background-color: #10B981;
            cursor: pointer;
            margin-top: -5px;
          }
          input[type="range"]::-moz-range-thumb {
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background-color: #10B981;
            cursor: pointer;
          }
          input[type="range"] {
            position: relative;
            background: #e2e8f0;
          }
           input[type="range"]::before {
             content: '';
             position: absolute;
             width: var(--seek-before-width);
             height: 100%;
             background: #10B981;
             border-top-left-radius: 5px;
             border-bottom-left-radius: 5px;
             z-index: 0;
           }
        `}</style>
        <div className="text-xs text-gray-500 self-end mt-1">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <img src={BOT_AVATAR} alt="avatar" className="w-10 h-10 rounded-full" />
    </div>
  );
};

export default AudioPlayer;