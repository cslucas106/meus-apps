# Monodiário: plano do projeto

Diário de **uma escolha por dia** (uma frase de abertura + uma palavra). Primeiro o front roda sozinho no GitHub Pages (dados falsos/locais), depois ganha backend na Cloudflare e por fim vira Mini App do Telegram.

---

## 1. Regras do produto (não mudam em nenhuma fase)

1. Existe um conjunto de **frases de abertura fixas** ("Hoje eu senti:", "Estou:", "Fiquei muito:"...). Todo dia a pessoa escolhe **uma frase + uma palavra** para completá-la. Essa dupla é o registro do dia (uma única escolha).
2. A escolha **trava à meia-noite** (no fuso do usuário). Dia passado não edita.
3. O que você escolheu **nunca aparece para ninguém**, só para o dono.
4. Só vai para o grupo o **dump mensal**, por escolha da pessoa, uma vez por mês.
5. A estante do grupo mostra apenas **capa e nome**.
6. Dia esquecido = página em branco (também conta nos dumps).
7. Cada palavra pertence a **uma categoria emocional fixa** (a análise sai de contagem, não de IA).
8. Ver o livro de outra pessoa exige **pedido + aprovação dela**. Quem for aprovado vê só **12 quadrados (um por mês)**, cada um com o **sentimento predominante** do mês. Nunca vê dias nem palavras, e só aparecem meses já fechados. A permissão **não expira**: só some quando o próprio dono revoga.

---

## 2. Estratégia em fases

| Fase | Onde roda | Dados | Usuário |
|------|-----------|-------|---------|
| 1 | GitHub Pages | localStorage + dados falsos | perfil local |
| 2 | Pages + Worker + D1 | banco real | login de teste |
| 3 | Mini App do Telegram | banco real | `initData` do Telegram |
| 4 | Grupos | banco real | estante e compartilhamento |
| 5 | Polimento | banco real | vídeo do dump, lembretes |

**Princípio central:** o front nunca fala direto com localStorage, Worker ou Telegram. Ele fala com **3 módulos trocáveis** (ver seção 4). Assim, mudar de fase é trocar um arquivo, não reescrever a interface.

---

## 3. Fase 1: Front no GitHub Pages

### 3.1 Estrutura de pastas

```
monodiario/
├── index.html
├── css/
│   ├── base.css          (variáveis, tipografia, tema)
│   ├── livro.css         (livro 3D e virar página)
│   └── dump.css          (cards 9:16)
├── js/
│   ├── app.js            (roteador de telas)
│   ├── clock.js          (data de "hoje" e trava da meia-noite)
│   ├── auth.js           (quem é o usuário: adapter)
│   ├── vendor/three.min.js  (Three.js r128, local)
│   ├── api.js            (dados: adapter local ou remoto)
│   ├── dump.js           (cálculo dos resumos)
│   ├── share.js          (gera imagem do card via canvas)
│   └── screens/
│       ├── livro.js
│       ├── hoje.js
│       ├── folhear.js
│       ├── capa.js
│       ├── estante.js
│       └── dump.js
├── data/
│   └── frases.json       (frases de abertura, palavras e categorias)
└── plano.md
```

### 3.2 Telas

- **Livro (home):** capa personalizada. Tocar abre a página de hoje.
- **Hoje:** passo 1, escolher a frase de abertura; passo 2, escolher a palavra que a completa. Confirmação → carimbo e trava.
- **Folhear:** dias anteriores; dias vazios em branco.
- **Personalizar capa:** cor, título, símbolo, textura.
- **Estante:** livros lado a lado (nesta fase com perfis falsos).
- **Dump mensal / anual:** slides 9:16, botão "salvar imagem".
- **Livro de outra pessoa (com permissão):** duas páginas, a esquerda com 6 quadrados (jan–jun) e a direita com 6 (jul–dez). Cada quadrado mostra o sentimento predominante do mês, com **emoji + nome da categoria** (ex.: "🌧️ Tristeza"); meses abertos ou sem registro ficam em branco.
- **Barra de amigos:** faixa horizontal, como a lista de amigos dos jogos, com as miniaturas das capas de quem já te liberou o livro. Tocar numa capa abre o livro dela (12 quadrados). Quem ainda está pendente aparece esmaecido com um relógio.

### 3.3 Livro 3D

- Usar **Three.js (r128)**. O CSS 3D foi testado e ficou ruim; o Three.js dá o fecho físico (a cinta presa na capa de trás que dá a volta e trava), o giro livre de 360° e os reflexos dos metais.
- Protótipo pronto: `livro3d-360.html`, que vira `screens/livro.js` (a capa lida e salva por `api.getCover()` / `saveCover()`).
- A biblioteca fica **dentro do projeto** (`js/vendor/three.min.js`), sem CDN.
- Respeitar `prefers-reduced-motion`: sem o giro automático e com a abertura instantânea.

### 3.4 Dados de conteúdo

Cada frase de abertura tem a **sua própria lista de palavras**, porque a gramática muda ("Hoje eu senti: cansaço" × "Estou: cansado"). Todas as palavras apontam para uma **categoria emocional**, e é a categoria que alimenta os dumps.

**`frases.json`**

```json
{
  "categorias": [
    { "id": "tristeza", "nome": "Tristeza", "emoji": "🌧️", "valencia": -2, "cor": "#3f6890" }
  ],
  "frases": [
    {
      "id": "estou",
      "texto": "Estou:",
      "opcoes": [
        { "id": "estou_tristeza", "palavra": "triste", "categoria": "tristeza" }
      ]
    }
  ]
}
```

**A categoria é o sentimento de verdade; a palavra é só a forma de dizer.** "Tristeza" (em *Hoje eu senti:*), "triste" (em *Estou:*) e "abatido(a)" (em *Fiquei muito:*) apontam todas para a categoria `tristeza` e **somam juntas**, nunca disputam entre si. Todas as contagens, o predominante e os quadrados usam a categoria, nunca a palavra.

**12 sentimentos** (limite fixo, para os votos não se espalharem). Cada um tem nome, emoji, cor e **valência** (de -2 a +2):

| Sentimento | Valência | | Sentimento | Valência |
|---|---|---|---|---|
| ☀️ Alegria | +2 | | 🍂 Saudade | 0 |
| 🎉 Animação | +2 | | 🌀 Ansiedade | -1 |
| 🌿 Calma | +1 | | 🌙 Cansaço | -1 |
| 🌸 Gratidão | +1 | | 🌧️ Tristeza | -2 |
| 🌱 Esperança | +1 | | 🥀 Abatimento | -2 |
| ⚡ Coragem | +1 | | 🔥 Raiva | -2 |

Só são o **mesmo sentimento** as formas da mesma ideia (tristeza / triste / chateado). Nuances diferentes (abatimento ≠ tristeza) são sentimentos separados.

Regras de conteúdo:
- Começar com **5 a 8 frases de abertura** e **8 a 12 palavras** em cada uma.
- Cobrir **todas as categorias em cada frase**, para a escolha de frase não limitar o sentimento.
- Gênero: na primeira versão, escrever as palavras com os dois gêneros, como **"cansado(a)"**. Se o projeto crescer, guardar o gênero no perfil e flexionar na exibição.
- Cada frase de abertura traz **os 12 sentimentos**, cada um na forma gramatical dela ("senti *tristeza*", "estou *triste*").
- A frase escolhida também é dado: dá para mostrar "você usa mais *Estou:* nas segundas".

### 3.5 Lógica do dump (sem IA nesta fase)

- **Mensal:** contar categorias do mês → sentimento prevalecente + 2º e 3º lugares. Texto montado por **modelos de frase** ("Este mês foi de muitos sentimentos, o que mais apareceu foi {x}").
- **Quem vence o mês:** conta-se por sentimento. Se o 1º lugar tem **mais de 1 dia de vantagem** sobre os demais, ele vence. Se há **empate ou diferença de até 1 dia**, o mês é lido **pela soma**: média das valências dos sentimentos empatados, ponderada pelo número de dias. Média ≥ +0,5 → ☀️ Alegria; ≤ -0,5 → 🌧️ Tristeza; no meio → 🌗 Agridoce (resultado composto, não é um dos 12). O card avisa quando o resultado veio pela soma. A margem (1 dia) fica numa constante para ajustar.
- **Anual:** matriz `dia da semana × categoria` → "nas segundas você se sentiu mais {x}, nas sextas mais {y}". Também mês mais intenso e maior sequência de dias registrados.
- A IA (Workers AI) entra só na Fase 2/5 para deixar o texto mais natural.

### 3.6 Imagem do dump

- Gerar com `<canvas>` no próprio navegador (1080×1920).
- Exportar com `canvas.toBlob`. No celular, usar `navigator.share` quando existir; senão, baixar o arquivo.
- Vídeo animado fica para a Fase 5.

### 3.7 Cuidados específicos do GitHub Pages

- Site em `usuario.github.io/monodiario/`: usar **caminhos relativos** (`./css/...`), nunca `/css/...`.
- Navegação por **hash** (`#/hoje`, `#/estante`), porque Pages não tem fallback para rotas.
- HTTPS já vem ativo, e o Telegram exige HTTPS para Mini Apps.
- Fontes e bibliotecas: nada externo. Three.js vai em `js/vendor/`; se algo vier de CDN, fixar versão.
- Layout **mobile-first** (largura 360 a 430px), pensando desde já no Mini App.
- Respeitar `env(safe-area-inset-*)` e cores via variáveis para tema claro/escuro.

### 3.8 Modo de teste

Para testar a trava e os dumps sem esperar dias, `clock.js` aceita um parâmetro de desenvolvimento: `?hoje=2026-11-30`. Também um botão escondido "popular com dados falsos" que preenche meses inteiros.

### 3.9 Critérios de pronto da Fase 1

- [ ] Escolher frase + palavra do dia e ver a página travar
- [ ] Mudar de dia (via `?hoje=`) impede editar o dia anterior
- [ ] Folhear dias passados e dias em branco
- [ ] Personalizar a capa e persistir ao recarregar
- [ ] Estante com 5+ perfis falsos
- [ ] Dump mensal e anual gerando imagem
- [ ] Funciona bem em tela de celular
- [ ] Publicado no GitHub Pages

---

## 4. A camada que prepara o Telegram (escrever na Fase 1)

Três módulos com a **mesma interface** nas duas versões.

### `auth.js`
```js
// Fase 1: perfil local fixo
getUser() -> { id, nome }
// Fase 3: lê Telegram.WebApp.initData e valida no Worker
```

### `api.js`
```js
getEntry(date)            saveEntry(date, fraseId, opcaoId)
listEntries(mes)          getCover()          saveCover(cfg)
getDump(tipo, periodo)    listShelf(groupId)  shareDump(groupId, mes)
// Fase 1: localStorage + JSON falso
// Fase 2: fetch() para o Worker
```

### `clock.js`
```js
today(tz) -> "2026-11-25"
// Fase 1: relógio do aparelho (+ ?hoje= para testes)
// Fase 2: o Worker devolve a data oficial; o relógio do celular nunca decide a trava
```

**Regra de ouro:** nenhuma tela chama `localStorage`, `fetch` ou `window.Telegram` diretamente. Só passam por esses três módulos.

---

## 5. Fase 2: Cloudflare (Worker + D1)

### Modelo de dados

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,        -- id do Telegram
  nome TEXT,
  fuso TEXT DEFAULT 'America/Sao_Paulo',
  capa TEXT,                     -- JSON da personalização
  criado_em TEXT
);

CREATE TABLE entries (
  user_id INTEGER,
  data TEXT,                     -- AAAA-MM-DD no fuso do usuário
  frase_id TEXT,                 -- ex.: 'estou'
  opcao_id TEXT,                 -- ex.: 'estou_leve'
  categoria TEXT,                -- copiada no momento do registro
  UNIQUE(user_id, data)
);

CREATE TABLE summaries (
  user_id INTEGER,
  tipo TEXT,                     -- 'mensal' | 'anual'
  periodo TEXT,                  -- '2026-11' | '2026'
  dados TEXT,                    -- JSON do resumo
  UNIQUE(user_id, tipo, periodo)
);

CREATE TABLE group_members (
  chat_id INTEGER,
  user_id INTEGER,
  UNIQUE(chat_id, user_id)
);

CREATE TABLE shared_dumps (
  chat_id INTEGER,
  user_id INTEGER,
  periodo TEXT,
  message_id INTEGER,
  UNIQUE(chat_id, user_id, periodo)
);

CREATE TABLE access_requests (
  chat_id INTEGER,               -- grupo onde se descobriram (só informativo)
  requester_id INTEGER,          -- quem pede para ver
  owner_id INTEGER,              -- dono do livro
  status TEXT,                   -- 'pendente' | 'aprovado' | 'negado' | 'revogado'
  decidido_em TEXT,
  UNIQUE(requester_id, owner_id)
);
```

### Rotas do Worker

| Rota | O que faz |
|------|-----------|
| `GET /hoje` | data oficial e estado do dia (já registrado ou não) |
| `POST /entry` | grava frase + palavra (só se `data == hoje` e a opção pertence à frase) |
| `GET /entries?mes=` | lista os próprios dias |
| `GET/PUT /capa` | personalização |
| `GET /dump?tipo=&periodo=` | resumo do usuário |

### Pontos de atenção

- A trava é no **servidor**: `UNIQUE(user_id, data)` + comparação com a data calculada pelo fuso do usuário.
- **CORS**: liberar apenas a origem do GitHub Pages.
- **Cron horário**: fecha o mês de quem acabou de virar o mês no fuso local e salva em `summaries`.
- Texto do dump: modelo de frase como padrão, Workers AI como melhoria opcional.

---

## 6. Fase 3: Telegram Mini App

1. Criar o bot no **BotFather** (`@monodiario`) e configurar o Mini App com a URL do GitHub Pages.
2. No `index.html`, incluir `telegram-web-app.js` e chamar `Telegram.WebApp.ready()` e `expand()`.
3. Trocar `auth.js`: enviar `Telegram.WebApp.initData` no cabeçalho de cada requisição.
4. No Worker: **validar o `initData` por HMAC** com o token do bot e checar `auth_date` recente. Só então confiar no `user.id`.
5. Adaptar o tema: usar `Telegram.WebApp.themeParams` como variáveis CSS.
6. Usar `MainButton` e `BackButton` do Telegram para confirmar a escolha e voltar.
7. Webhook do bot → Worker. Comandos: `/start`, `/hoje`.
8. **Lembrete diário** via Cron: o bot manda "já fez seu registro de hoje?" no horário definido pelo usuário.

Critério de pronto: abrir pelo Telegram, fazer o registro e ver o mesmo dado ao abrir de outro aparelho.

---

## 7. Fase 4: Grupos e estante

1. Bot no grupo com `/estante`: posta um **link direto do Mini App** com `startapp=<chat_id>` (em grupos, botões `web_app` não funcionam, só o link direto).
2. Ao abrir por esse link, o Worker confirma com `getChatMember` e grava em `group_members`.
3. `GET /estante?chat=` revalida a participação **a cada chamada**. Quem saiu do grupo some e quem não é membro não vê nada.
4. A estante devolve só: nome, capa e selo de dump compartilhado. **Nunca consulta `entries`.**
5. **Compartilhar dump:** no fim do mês o bot manda o dump no privado, com botão "compartilhar no grupo". O usuário escolhe o grupo, o bot posta o card (imagem) e grava em `shared_dumps`. Botão "remover" apaga a mensagem e o selo.
6. **Pedir acesso ao livro de alguém:**
   - Na estante, tocar no livro → "pedir para ver". Cria uma linha `pendente` em `access_requests`.
   - O bot avisa o dono no privado com botões **Aprovar / Negar**. Negar não notifica o motivo.
   - Aprovado uma vez, a pessoa entra na **barra de amigos** do pedinte e vê os 12 quadrados do ano. O Worker devolve **só a categoria predominante por mês fechado**, calculada na hora a partir de `summaries`, sem ler palavras nem dias.
   - O acesso **não expira**. O dono pode **revogar** quando quiser (tela "Quem pode ver meu livro"), e a capa some da barra do outro na hora.
   - **O grupo serve só para descobrir** quem tem diário (as estantes). O acesso aprovado é **independente do grupo**: se alguém sair, a permissão continua até o dono revogar.

---

## 8. Fase 5: Polimento

- Dump em **vídeo curto** (slides animados exportados no cliente com `MediaRecorder`, ou gerado por serviço).
- Textos do dump com Workers AI, mantendo o modelo de frase como plano B.
- Mais frases de abertura e palavras, com temas por estação ou época.
- Personalização avançada da capa (texturas, símbolos desbloqueáveis por sequência de dias).
- Exportar o diário do ano (PDF) para o próprio usuário.
- Fuso e horário do lembrete editáveis.

---

## 9. Riscos e decisões em aberto

- **Dia esquecido:** fica em branco. Decidir se o dump mostra "dias não registrados" como informação.
- **Qualidade do conteúdo:** a análise emocional depende de boas palavras. Revisar o mapeamento palavra → categoria com calma.
- **Mensagem de dump em grupo:** o bot só consegue apagar mensagens que ele mesmo postou, então o card compartilhado deve sempre ser postado pelo bot.
- **Privacidade:** nada das escolhas do dia em logs, analytics ou mensagens de erro.
- **Limites da Cloudflare (plano grátis):** o volume esperado cabe com folga em Workers + D1.

---

## 10. Ordem de trabalho sugerida

1. `frases.json` (5 frases de abertura com ~8 palavras cada já dá para começar)
2. `base.css` + `clock.js` + `api.js` local + `auth.js` local
3. Tela **Hoje** funcionando com trava
4. Livro 3D + capa
5. Folhear
6. Dump mensal (cálculo + imagem), depois o anual
7. Estante falsa
8. Publicar no GitHub Pages e testar no celular
9. Worker + D1, depois Telegram, depois grupos
