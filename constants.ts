import { FunnelStep, MessageType } from './types';

export const BOT_AVATAR = 'https://i.postimg.cc/NfTx5SqN/0680d1dd-0f26-4a13-a343-3e9bb4a00a75.png';
export const BOT_NAME = 'Catedral Metropolitana';
export const NOTIFICATION_AUDIO = 'https://cdn.jsdelivr.net/gh/packtypebot/free-template-packtypebot/audio.mp3';
export const REDIRECT_URL = 'https://pay.lowify.com.br/checkout?product_id=TdCqW7';

export const INITIAL_FUNNEL: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/1-boas-vindas.mp3', delay: 2 },
  { type: MessageType.OPTIONS, delay: 6 },
];

export const YES_BRANCH: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02-reposta-sim.mp3', delay: 2 },
  { type: MessageType.TEXT, content: 'Que bom! Vamos continuar.', delay: 9},
];

export const NO_BRANCH: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02.1-reponta-nao.mp3', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/02.2.mp3', delay: 12 },
  { type: MessageType.TEXT, content: 'Entendido, mas tenho algo especial para você.', delay: 4},
];

export const MAIN_FUNNEL: FunnelStep[] = [
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/04.mp3', delay: 3 },
  { type: MessageType.TEXT, content: '📖 Orações Poderosas do Papa Francisco', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/HxxK5YCm/Chat-GPT-Image-7-de-mai-de-2025-05-13-07.png', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/05.mp3', delay: 7 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/07.mp3', delay: 7 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/08.mp3', delay: 13 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/09.mp3', delay: 6 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/10.mp3', delay: 5 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/CLf3mxnL/Chat-GPT-Image-7-de-mai-de-2025-05-11-48.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/nVyCgDXk/DEPOIMENTO-01.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/c1bb9MPp/Chat-GPT-Image-12-de-mai-de-2025-02-54-07.png', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/d3PwHG5T/DEPOIMENTO-05.png', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/12.mp3', delay: 13 },
  { type: MessageType.TEXT, content: '🎁 Colar Religioso 100% Grátis!', delay: 2 },
  { type: MessageType.IMAGE, imageUrl: 'https://i.postimg.cc/3r658j7T/unnamed.jpg', delay: 2 },
  { type: MessageType.TEXT, content: 'Porém, Disponível apenas para os 100 primeiros pedidos de hoje!', delay: 2 },
  { type: MessageType.TEXT, content: '❤️ Esse é o seu momento.', delay: 2 },
  { type: MessageType.TEXT, content: 'Por apenas R$29, você leva para casa um guia espiritual completo, com orações para todos os dias.', delay: 2 },
  { type: MessageType.TEXT, content: '⚠️ Não espere mais. Leve paz, proteção e bênção para sua vida ainda hoje.', delay: 2 },
  { type: MessageType.CTA, content: 'Quero meu LIVRO agora 🙏 – R$29', delay: 2 },
  { type: MessageType.AUDIO, audioUrl: 'https://importar-arquivors.online-web-ofcial.shop/wp-content/uploads/2025/10/11.mp3', delay: 13 },
  { type: MessageType.TEXT, content: '⚠️ Atenção: estará disponível com este valor até nas próximas 24 horas.', delay: 2 },
  { type: MessageType.TEXT, content: 'Garanta já o seu antes que termine.', delay: 2 },
  { type: MessageType.REDIRECT, delay: 1 },
];