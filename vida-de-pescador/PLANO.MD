# Plano de Criação: Vida de Pescador

**Conceito:** Pesca Caótica na Noite. Simulação física de pesca com estética Noir (alto contraste, símbolos visuais) e renderização 100% SVG.

## Estrutura de Arquivos

| Arquivo (Camininho) | Função Principal | Detalhes (Noir/SVG/Action) |
| :--- | :--- | :--- |
| `index.html` | Estrutura base do DOM | Contêiner_principal, load scripts. |
| `style.css` | Design Visual e Interativo | Estilo Noir, tipografia antiga, responsividade total. |
| `game.js` | Motor do Jogo | Loop principal, gerenciamento de estados (repouso, pesca, naufrágio). |
| `boat.js` | Navegação | Movimento do barco entre pontos fixos, som das ondas. |
| `physics.js` | Mecânica de Pesca | Algoritmo de trunção, resistência do cabo, arrasto. |
| `entities.js` | Entidades (Peixes/Sombras) | Define classes para `BarraDeTensao`, `Peixe`, `Bolha`. |
| `graphics.js` | Geração de SVGs | Funções para desenhar barco, ondas, linhas e peixes via código. |
| `ui.js` | Interface do Usuário | Telas de Start, Pause, Inventário e HUD na tela. |
| `data.js` | Sistema de Drops e Valores | Tabuleiro de botins, raridades (pedra, rato, estrela do mar). |

## Visão do Layout (SVG)

O jogo não usará imagens (.png). Tudo será uma biblioteca de formas SVG que o joga no Canvas da página:

1.  **Fundo:** Gradientes SVG animados (azul profundo/escuro) simulando a água da baía.
2.  **Barco:** Silhueta SVG preta (ontop-of) que se move sobre as ondas.
3.  **Física:** A linha de pesca desenhada como um `<path>` com um polígono (`<polygon>`) no chumbinho ou isca.
4.  **Peixes:** Formas orgânicas em preto com detalhes brilhantes apenas no corpo.

## Fluxo de Criação (Passo a Passo)

**1. Milagre HTML e CSS (Módulos 1 & 2)**
*   Crie o `index.html` com script carregando `.js`.
*   Crie `style.css`. Defina a paleta de cores: `#0a0a0a` (Preto profundo), `#1a1a1a` (Cinza carvão), `#c0c0c0` (Sombra). Uso de neon vermelho para barcas de tensão. `font-family: 'Courier New', monospace;`.

**2. Motor e Navegação (Módulos 3 & 4)**
*   Crie `game.js`. Implemente um `requestAnimationFrame`.
*   Crie `boat.js`. Permita que o usuário toque nos cantos da tela para mover o barco para a esquerda/direita. A água moverá como um loop infinito de SVG.

**3. SVG em Ação (Módulo 7)**
*   Crie `graphics.js`. Escreva funções que criam linhas SVG (`<line>`, `<path>`) path-based para simular a linha fina cantando ao vento.
*   Faça a linha conectar o barco ao "Ponto de Lançamento" da tela.

**4. A Aventura (Módulo 8)**
*   Implemente os eventos aleatórios. Às vezes a isca morder, às vezes vem uma caçamba de lixo.
*   Implemente `physics.js`: Ao tocar para puxar, a tensão sobe. A arrastar, a tensão desce.
*   Se a tensão chegar no limite, a linha fará "Pó" ou o pescador briga com a pesca.

**5. Polimento e System (Módulos 5, 6, 9)**
*   Crie `entities.js` para gerenciar os estados de fadiga ou "Sangue no mar".
*   Crie `data.js` com os valores de venda.
*   Finalize com `ui.js` para mostrar dinheiro e raízes quando um peixe for pego.