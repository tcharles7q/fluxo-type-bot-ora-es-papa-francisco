import React from 'react';
import { BOT_AVATAR, BOT_NAME } from '../constants';

const LoadingScreen: React.FC = () => (
  <div className="w-full h-screen bg-cover bg-center flex flex-col justify-center items-center font-sans" style={{ backgroundImage: "url('https://i.postimg.cc/tggRvL69/fundo-whats-app.png')" }}>
    <div className="flex flex-col items-center text-center p-6 bg-white/30 backdrop-blur-md rounded-xl shadow-lg animate-fade-in">
       <img src={BOT_AVATAR} alt="Bot Avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md" />
       <h1 className="font-bold text-2xl text-[#005E54]">{BOT_NAME}</h1>
       <p className="text-gray-700 mt-2 font-medium">Preparando sua oferta especial...</p>
       <div className="mt-6 flex items-center space-x-2">
         <svg className="animate-spin h-6 w-6 text-[#005E54]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <span className="text-gray-600 font-semibold">Carregando...</span>
       </div>
    </div>
  </div>
);

export default LoadingScreen;
