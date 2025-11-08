import React from 'react';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 animate-fade-in-up">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <p className="mb-2 sm:mb-0 text-center sm:text-left">
            Usamos cookies para garantir que você tenha a melhor experiência e para fins de marketing.
            <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-gray-300">Saiba mais</a>.
          </p>
          <div className="flex justify-center gap-4 flex-shrink-0 mt-2 sm:mt-0">
            <div 
              role="button"
              tabIndex={0}
              onClick={onAccept}
              onKeyPress={(e) => handleKeyPress(e, onAccept)}
              className="bg-[#035d54] hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 cursor-pointer"
            >
              Aceitar
            </div>
            <div 
              role="button"
              tabIndex={0}
              onClick={onDecline}
              onKeyPress={(e) => handleKeyPress(e, onDecline)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 cursor-pointer"
            >
              Recusar
            </div>
          </div>
      </div>
    </div>
  );
};

export default CookieConsent;