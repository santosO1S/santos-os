# SANTOS OS — v0.3.0 (Dispositivo Virtual)

Simulador hacker **fictício**, agora em formato de **dispositivo virtual** estilo smartphone.

Nenhuma rede ou sistema real é acessado.

## O que mudou nesta versão

- Interface completa de **celular** (home screen, dock, status bar, lock screen)
- Código de desbloqueio: **1234**
- Apps em tela cheia com navegação por botão Voltar / Home
- Mini-apps novos: Calculadora, Relógio, Notas, Música, Lanterna, Fotos, Calendário
- Todos os sistemas de jogo anteriores preservados (missões, contratos, terminal, ranking, etc.)

## Como usar

1. Abra `index.html` (ou faça deploy no Netlify)
2. Crie / escolha um operador
3. Toque em **Continuar**
4. Na tela de bloqueio, digite **1234**
5. Use os ícones da home screen

## Estrutura principal

- `index.html` — estrutura do dispositivo
- `css/style.css` — visual estilo iOS + neon hacker
- `js/phone.js` — home, lock, abertura de apps, mini-apps
- `js/wm.js` — ponte de compatibilidade com o código antigo
- `js/data.js` — conteúdo do jogo (locais, missões, itens…)
- Demais arquivos JS — lógica de jogo inalterada em essência

## Deploy no Netlify

1. Compacte a pasta com `index.html` na raiz
2. Deploy manual no painel do Netlify
3. Configure `ADMIN_PASSWORD` se for usar o painel admin

## Compatibilidade de saves

Saves da v0.2.1 e 0.3 continuam válidos (`localStorage`).
