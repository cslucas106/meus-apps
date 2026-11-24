# Plano de Criação — Facada Noir

## Visão Geral
Jogo de investigação noir 2D em canvas, progressivo, com atmosfera de mistério, som imersivo e visual em preto e branco com acentos vermelhos.

---

## Estrutura de Arquivos (ordem de criação)

### 1. Configuração e Base
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/index.html` | Ponto de entrada, carrega CSS/JS, meta viewport, canvas principal | 50 |
| `facada-noir/style.css` | Reset, canvas fullscreen, fontes noir, UI overlays, animações | 150 |
| `facada-noir/js/config.js` | Constantes globais: cores, resolução, camadas Z, estados do jogo, chaves de save | 80 |
| `facada-noir/js/utils.js` | Helpers: rand, clamp, lerp, distância, formatação tempo, localStorage wrapper | 100 |

### 2. Motor Principal
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/js/core/game.js` | Loop principal (requestAnimationFrame), gerenciador de estados, delta time, resize | 120 |
| `facada-noir/js/core/state-machine.js` | Máquina de estados: menu, playing, paused, dialogue, investigation, gameover, credits | 100 |
| `facada-noir/js/core/asset-loader.js` | Carrega imagens, áudio, JSON de níveis/diálogos; barra de progresso; cache | 150 |
| `facada-noir/js/core/input.js` | Teclado, mouse, touch (joystick virtual + botões), mapeamento de ações | 180 |
| `facada-noir/js/core/audio.js` | Web Audio API: música em camadas, SFX, volume mestre, crossfade, spatial básico | 150 |
| `facada-noir/js/core/renderer.js` | Contexto canvas, camadas (bg, entidades, fg, ui), shaders noir (vignette, film grain), shake | 200 |

### 3. Entidades e Componentes
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/js/entities/entity.js` | Classe base: position, velocity, sprite, hitbox, update/draw, tags, z-index | 100 |
| `facada-noir/js/entities/player.js` | Movimento 8-dir, interação, stamina (correr), lanterninha, inventário, pistas coletadas | 200 |
| `facada-noir/js/entities/npc.js` | IA simples: patrol, idle, diálogo, reação a jogador, rotas scriptadas | 150 |
| `facada-noir/js/entities/interactable.js` | Objetos clicáveis: pistas, portas, alavancas, corpos, notas; estado (aberto/fechado) | 120 |
| `facada-noir/js/entities/light.js` | Sistema de luz dinâmica: lanterninha do jogador, luzes fixas, sombras (raycast simples) | 180 |

### 4. Sistemas de Jogo
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/js/systems/dialogue.js` | Árvore de diálogos, retratos, digitação, escolhas, flags de progresso | 200 |
| `facada-noir/js/systems/investigation.js` | Quadro de pistas (mind map), conexões, dedução, "momento eureka" | 180 |
| `facada-noir/js/systems/inventory.js` | Itens: chaves, documentos, faca, lanterninha; combinação, uso no mundo | 150 |
| `facada-noir/js/systems/progression.js` | Capítulos, checkpoints, flags globais, desbloqueio de áreas, New Game+ | 120 |
| `facada-noir/js/systems/save.js` | Serialização estado completo (player, flags, inventário, capítulo, tempo) | 100 |

### 5. Cenários e Níveis
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/js/scenes/scene-base.js` | Classe base: setup, teardown, spawn points, limites câmera, música ambiente | 80 |
| `facada-noir/js/scenes/rua-principal.js` | Capítulo 1: becos, bar, delegacia exterior, NPCs testemunhas | 150 |
| `facada-noir/js/scenes/delegacia.js` | Capítulo 2: interior, arquivos, interrogatório, chefe | 150 |
| `facada-noir/js/scenes/apartamento-vitima.js` | Capítulo 3: cena do crime, pistas forenses, flashback jogável | 150 |
| `facada-noir/js/scenes/submundo.js` | Capítulo 4: clube noturno, chefão, confronto final, múltiplos finais | 180 |
| `facada-noir/js/scenes/cutscene.js` | Cutscenes scriptadas: câmera, texto, fade, skip, credits | 120 |

### 6. UI e HUD
| Arquivo | Função | Linhas ~ |
|---------|--------|----------|
| `facada-noir/js/ui/hud.js` | Lanterninha (bateria), stamina, capítulo, hora, dicas contextuais | 120 |
| `facada-noir/js/ui/menu.js` | Menu principal, continue, new game, settings, credits, animações de entrada | 150 |
| `facada-noir/js/ui/notebook.js` | Caderno de detetive: pistas, mapa, perfis, dedução (aba lateral) | 200 |
| `facada-noir/js/ui/dialogue-box.js` | Caixa de diálogo: retrato, texto digitado, escolhas, auto-advance | 120 |
| `facada-noir/js/ui/transition.js` | Fade in/out, iris, film burn, loading entre cenas | 80 |

### 7. Dados (JSON)
| Arquivo | Função |
|---------|--------|
| `facada-noir/data/dialogues/pt-br.json` | Todas as falas, escolhas, flags, retratos por NPC/cena |
| `facada-noir/data/clues.json` | Definição de pistas: nome, descrição, sprite, conexões, capítulo |
| `facada-noir/data/items.json` | Itens: tipo, sprite, descrição, combináveis, uso |
| `facada-noir/data/scenes.json` | Metadados de cenas: spawn, música, limites, NPCs, interativos |
| `facada-noir/data/progression.json` | Capítulos, objetivos, flags de desbloqueio, finais |

### 8. Assets (pastas)