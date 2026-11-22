# Fofo Shooter

Um jogo de tiro charmoso (twin-stick shooter) feito em HTML5/Canvas.

## Controles
- **Joystick (direita)**: Movimento + mira
- **Botão 💥 (esquerda)**: Atirar
- **Teclado**: WASD / Setas para mover, Espaço para atirar

## Características
- 3 tipos de inimigos com comportamentos diferentes
- Power-ups: vida (♥) e upgrade de tiro (★)
- 3 níveis de arma: Normal → Spread → Chaos
- Ondas progressivas de dificuldade
- Efeitos sonoros via Web Audio API
- Partículas e screen shake
- ~280 linhas de JS divididas em 4 arquivos (sem módulos ES)

## Como rodar
Abra `index.html` no navegador (precisa de servidor local para áudio no Chrome: `npx serve` ou `python -m http.server`).