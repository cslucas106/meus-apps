# Plano de Desenvolvimento – Facada Noir

## Estrutura de Arquivos (ordem de criação)

| Ordem | Caminho completo | Função |
|-------|------------------|--------|
| 1 | `facada-noir/index.html` | Página inicial do jogo; referencia CSS e scripts na ordem correta. |
| 2 | `facada-noir/style.css` | Estilos globais, layout responsivo para tela de celular, tema noir (preto, cinza, detalhes vermelhos). |
| 3 | `facada-noir/game.js` | Core do jogo: loop principal, física básica, detecção de colisões, lógica de estado (menu, jogo, pausa, fim). |
| 4 | `facada-noir/controls.js` | Gerenciamento de entradas: toque, arrasto, toques em botões para mover personagem e arremessar faca. |
| 5 | `facada-noir/ui.js` | Renderização da interface (pontuação, tempo, HUD, menu de pausa, tela de fim). |
| 6 | `facada-noir/config.js` | Variáveis de configuração (velocidade do personagem, dano da faca, taxa de recarga, etc.). |
| 7 | `facada-noir/assets/` | Diretório contendo recursos visuais e sonoros: |
|   | `assets/images/` | Sprites do personagem, inimigos, faca, fundo noir, UI (botões, ícones). |
|   | `assets/sounds/` | Efeitos sonoros (arremesso, impacto, passos, música ambiente). |
|   | `assets/fonts/` | Fonte estilizada para textos do jogo (ex.: “Playfair Display”). |
| 8 | `facada-noir/manifest.json` | Manifesto PWA (opcional) para instalar como app nativo. |
| 9 | `facada-noir/README.md` | Título + breve descrição (já criado). |

---

## Telas Principais

1. **Menu Início**  
   - Logotipo “Facada Noir”  
   - Botões: *Jogar*, *Instruções*, *Créditos*

2. **Tela de Jogo**  
   - Área de jogo (canvas ou div) com fundo noir, personagem central, inimigos.  
   - HUD: tempo restante, número de facas, score.

3. **Tela de Pausa**  
   - Opções: *Reiniciar*, *Sair*.

4. **Tela de Fim**  
   - Score final, botão *Recomeçar*.

5. **Tela de Créditos**  
   - Lista de desenvolvedores e artistas.

---

## Controles (Celular)

- **Movimento**: joystick virtual (canto inferior esquerdo).  
- **Arremesso**: toque rápido na tela (ou botão “Lançar” no canto inferior direito).  
- **Recarga**: swipe à direita na área da faca, ou toque no ícone “recarregar”.  
- **Ação extra**: deslizar à esquerda para “fumaça” de distração.

---

## Ordem de Desenvolvimento

1. Definir conceito: objetivos de nível, inimigos, mecânicas, progressão.  
2. Prototipar visual: layout de tela, cores noir, ícones, sprites básicos.  
3. Criar estrutura de arquivos e pastas de assets.  
4. Implementar `game.js` (loop, estados, física).  
5. Implementar `controls.js` (joystick, toques, recarga).  
6. Implementar `ui.js` (HUD, menus).  
7. Adicionar assets (sprites, sons, fontes).  
8. Testar mecânicas e ajustar parâmetros.  
9. Polir visual: animações, efeitos de impacto, transições.  
10. Polir sonoro: trilha noir, efeitos de faca.  
11. Testar em dispositivos: responsividade, canvas redimensionado.  
12. Adicionar PWA (opcional).  
13. Revisão final: código limpo, comentários, testes de colisão.

---

## Pontos de Atenção

- **Canvas dimensionado**: usar `clientWidth` da div container, multiplicar por `devicePixelRatio`.  
- **Controle de toque**: zonas distintas para joystick e arremesso para evitar conflito.  
- **Performance**: otimizar colisões, usar bounding boxes simples.  
- **Acessibilidade**: contraste alto, textos legíveis, opção de controle por teclado para desktops.  