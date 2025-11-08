import { FunnelStep, MessageType } from './types';

export const BOT_AVATAR = 'https://i.postimg.cc/NfTx5SqN/0680d1dd-0f26-4a13-a343-3e9bb4a00a75.png';
export const BOT_NAME = 'Catedral Metropolitana';
export const NOTIFICATION_AUDIO = 'https://cdn.jsdelivr.net/gh/packtypebot/free-template-packtypebot/audio.mp3';
export const REDIRECT_URL = 'https://pay.lowify.com.br/checkout?product_id=TdCqW7';

export const INITIAL_FUNNEL: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/1-boas-vindas.mp3', delay: 2 },
  { type: MessageType.OPTIONS, delay: 2 },
];

export const YES_BRANCH: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02-reposta-sim.mp3', delay: 2 },
];

export const NO_BRANCH: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02.1-reponta-nao.mp3', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02.2.mp3', delay: 2 },
];

export const MAIN_FUNNEL: FunnelStep[] = [
  // BLOCO 3 (ou 5, conforme usuário): Apresentação do Livro
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/04.mp3', delay: 2 },
  { type: MessageType.TEXT, content: '📖 <b><i>Orações Poderosas do Papa Francisco</i></b>', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/HxxK5YCm/Chat-GPT-Image-7-de-mai-de-2025-05-13-07.png', delay: 2 },

  // BLOCO 4: Benefícios e Prova Social (Áudios em sequência)
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/05.mp3', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/07.mp3', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/08.mp3', delay: 2 }, 
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/09.mp3', delay: 2 }, 
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/10.mp3', delay: 2 }, 

  // BLOCO 5: Depoimentos (Imagens aparecem enquanto o último áudio toca)
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/CLf3mxnL/Chat-GPT-Image-7-de-mai-de-2025-05-11-48.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/nVyCgDXk/DEPOIMENTO-01.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/c1bb9MPp/Chat-GPT-Image-12-de-mai-de-2025-02-54-07.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/d3PwHG5T/DEPOIMENTO-05.png', delay: 2 },
  
  // BLOCO 6: Bônus
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/12.mp3', delay: 2 }, 
  { type: MessageType.TEXT, content: '🎁 <b>Colar Religioso 100% Grátis!</b>', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/3r658j7T/unnamed.jpg', delay: 2 },

  // BLOCO 7: Oferta e Urgência
  { type: MessageType.TEXT, content: 'Porém, Disponível apenas para os 100 primeiros pedidos de hoje!', delay: 2 }, 
  { type: MessageType.TEXT, content: '❤️ Esse é o seu momento.', delay: 2 },
  { type: MessageType.TEXT, content: 'Por apenas <b>R$29</b>, você leva para casa <b>um guia espiritual completo</b>, com orações para todos os dias.', delay: 2 },
  { type: MessageType.TEXT, content: '⚠️ Não espere mais. Leve paz, proteção e bênção para sua vida <b>ainda hoje</b>.', delay: 2 },
  
  // BLOCO 8: CTA
  { type: MessageType.CTA, content: 'Quero meu LIVRO agora 🙏 – R$29', delay: 2 },

  // Após o clique no CTA
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/11.mp3', delay: 2 },
  { type: MessageType.TEXT, content: '⚠️ <b>Atenção:</b> estará disponível com este valor até nas próximas 24 horas.', delay: 2 }, 
  { type: MessageType.TEXT, content: 'Garanta já o seu antes que termine.', delay: 2 },
  
  // BLOCO 9: Redirecionamento
  { type: MessageType.REDIRECT, delay: 2 },
];