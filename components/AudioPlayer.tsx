
import React, { useState, useRef, useEffect } from 'react';
import { BOT_AVATAR } from '../constants';

interface AudioPlayerProps {
  src: string;
}

const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const progressBarRef = useRef<HTMLInputElement>(null);
  // FIX: Initialize useRef with a value (null) and update the generic type.
  // The call `useRef<number>()` is invalid because it lacks an initial value
  // and `number` is not assignable from `undefined`.
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
        setDuration(audio.duration);
    };

    const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const whilePlaying = () => {
    if (progressBarRef.current) {
      progressBarRef.current.value = String(audioRef.current.currentTime);
      changePlayerCurrentTime();
    }
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  const togglePlayPause = () => {
    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(whilePlaying);
    } else {
      audioRef.current.pause();
      if(animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const changeRange = () => {
    if (progressBarRef.current) {
      audioRef.current.currentTime = Number(progressBarRef.current.value);
      changePlayerCurrentTime();
    }
  };

  const changePlayerCurrentTime = () => {
    if (progressBarRef.current) {
        const value = (Number(progressBarRef.current.value) / duration) * 100;
        progressBarRef.current.style.setProperty('--seek-before-width', `${value}%`);
        setCurrentTime(Number(progressBarRef.current.value));
    }
  };
  
  useEffect(() => {
    if(progressBarRef.current) {
        progressBarRef.current.max = String(duration);
    }
  }, [duration])

  return (
    <div className="flex items-center bg-gray-100 p-2 rounded-lg w-64 md:w-80">
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
            style={{'--seek-before-width': `${(currentTime / duration) * 100}%`} as React.CSSProperties}
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
