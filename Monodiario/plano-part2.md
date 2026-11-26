# Monodiário: plano da parte 2 (o que falta)

Continuação do `plano.md`. Aqui está só o que ainda não foi feito, mais as ideias novas combinadas nas últimas conversas.

---

## 1. Onde estamos

**Já funciona (Fase 1):**
- Frases e palavras (`frases.json`), relógio com trava do dia, tela Hoje com carimbo.
- Livro 3D na página inicial, sem os avisos de "toque / gire".
- Capa personalizável com botão **Salvar** e botões reorganizados.
- Foto do livro 3D (fechado, de frente) tirada ao salvar a capa e gerada sozinha se faltar.
- **Estante em 3D**: livros em pé numa estante de madeira, com sombras e 3 cenários (Biblioteca, Sala clara, Noite). O cenário escolhido fica salvo.
- Já testado no celular pelo GitHub Pages.

**Ainda é de teste:** perfis falsos na estante, dados só no `localStorage` (no aparelho), usuário fixo "Você".

---

## 2. Decisões em aberto (decidir antes de programar)

1. ~~O que é o carimbo do mês?~~ **Decidido: o carimbo é o dump do mês.**
   - O dump do mês aparece como um **carimbo em cima do mês** no livro aberto.
   - Regra: o mês só ganha carimbo com **no mínimo 5 dias registrados**. Meses abaixo disso ficam sem carimbo.
   - O `plano.md` (regra 8 e seção 3.2) ainda fala em "12 quadrados com o sentimento predominante". Deve ser atualizado: os quadrados viram os carimbos.
   - Ainda a definir o desenho do carimbo. Sugestão: emoji + nome do sentimento que mais apareceu no mês (como já estava nos quadrados), com cara de carimbo (borda, leve inclinação, cor do sentimento). Nada de dias nem palavras.

2. **Cenários da "casa".**
   Quantos cenários vão existir? Serão só visuais ou desbloqueáveis (por sequência de dias, por exemplo)? O cenário escolhido vale para a estante **e** para a página inicial.

3. **Virada do ano** (ver seção 4, item "Anos anteriores").
   Falta decidir o que acontece com o livro novo: começa do zero ou herda a capa do ano anterior?

4. **Acesso ao diário de outra pessoa.**
   O `plano.md` diz que a permissão não expira e só some quando o dono revoga. Confirmar que isso continua valendo também para o chat 1:1 e para grupos.

---

## 3. Fase 1 (o que falta para fechar)

Checklist do `plano.md`, com o estado atual:

- [x] Escolher frase + palavra do dia e ver a página travar
- [ ] Conferir a trava com `?hoje=` (mudar de dia impede editar o dia anterior)
- [ ] **Folhear**: conferir o estado (o `README.md` ainda diz "em breve", mas já existe o arquivo da tela)
- [x] Personalizar a capa e persistir ao recarregar
- [x] Estante com 5+ perfis falsos
- [ ] **Dump mensal e anual** gerando imagem 9:16 (conferir o estado, mesmo caso do Folhear)
- [x] Funciona bem em tela de celular
- [x] Publicado no GitHub Pages

Também falta:
- [ ] **Página inicial com cenário**: trocar o "livro flutuando no nada" por uma cena (mesa de madeira, luz quente), usando o mesmo cenário escolhido na estante.
- [ ] **Carimbo do dump no mês**: desenhar o carimbo (borda, inclinação, cor do sentimento) e mostrar nos meses com 5+ dias.
- [ ] **Livro aberto de outra pessoa**: duas páginas, 6 meses em cada, com o carimbo nos meses que passaram da regra dos 5 dias.
- [ ] Atualizar o `plano.md` (regra 8 e seção 3.2): quadrados viram carimbos.
- [ ] **Lombada** com o nome (e depois o ano), para a estante.
- [ ] Atualizar o `README.md` com o que já funciona.
- [ ] Apagar o CSS que sobrou dos avisos antigos (`.hint`).

---

## 4. Ideias novas a construir

### Estantes: três contextos, uma tela só
- **Sozinho** (abrindo em "Minhas notas"): mostra a sua capa e a lista de quem liberou o diário para você, como uma lista de amigos.
- **Dentro de um chat com um amigo:** mostra o diário dele. Só abre se ele aceitar.
- **Dentro de um grupo:** mostra as pessoas do grupo que já abriram o app. Quem não aprovou você fica fechado.
- A tela é a mesma nos três casos. O que muda é a lista de livros.
- Tocar num livro sem permissão leva a "pedir para ver".

### Anos anteriores (virada do ano)
- No perfil da pessoa aparece uma **prateleira dos anos**.
- Em 31/12 (no fuso da pessoa) o servidor guarda uma cópia congelada: capa, foto e o dump de cada mês.
- O design guardado é o último que a pessoa tinha até a virada.
- A lombada ganha o ano (ex.: 2026).
- Ao abrir um livro antigo, a pessoa vê como um amigo veria (só os meses carimbados).

### Cenários e decoração
- Depois da decisão 2, criar mais cenários (basta copiar um bloco em `CENARIOS` no `estante3d.js`).
- Itens de decoração: planta, abajur, vela. Podem ser desbloqueáveis.

---

## 5. Fase 2: Cloudflare (Worker + D1)

Tudo do `plano.md` (seção 5) continua valendo. Acrescentar:

- **Foto da capa no servidor.** Hoje a foto fica no aparelho. Para os amigos verem, ela precisa ir para o servidor (no D1 ou no R2 da Cloudflare). Só a foto da capa, nunca o conteúdo do diário.
- **Cenário escolhido** no cadastro do usuário.
- **Tabela dos anos guardados** (usuário, ano, capa, foto, resumos).
- **Cron da virada do ano**, no fuso de cada usuário.
- A trava do dia e a data oficial continuam sendo do servidor.

---

## 6. Fase 3: Mini App do Telegram

Tudo do `plano.md` (seção 6) continua valendo. Acrescentar:

- **Rolagem vertical da estante:** no Telegram, puxar para baixo pode fechar o app. Precisamos usar o recurso do Telegram que desliga esse gesto (conferir o nome atual na documentação).
- Usar o **tema claro/escuro** do Telegram como sugestão de cenário.
- Respeitar a área segura (barras do celular) com o Mini App em tela cheia.
- Testar o desempenho do 3D no WebView do Telegram, que pode ser mais lento que o navegador.

---

## 7. Fase 4: Grupos e estante

Tudo do `plano.md` (seção 7) continua valendo. Acrescentar:

- Os **três contextos** (sozinho, chat 1:1, grupo) e como o app descobre onde foi aberto.
- A estante de amigos usa a foto enviada por cada dono. Se não houver foto, usa o desenho de reserva.
- Tela "Quem pode ver meu livro" com revogar acesso.

---

## 8. Fase 5: Polimento

- Dump em vídeo curto.
- Textos do dump com IA, mantendo o modelo de frase como plano B.
- Mais frases e palavras, com temas por época.
- Exportar o diário do ano em PDF.
- Lembretes diários com horário escolhido pela pessoa.
- Opção de "qualidade baixa" no 3D para celulares fracos.

---

## 9. Riscos novos

- **Desempenho do 3D:** a estante usa sombras reais e a geração da foto abre um segundo contexto 3D por um instante. Em celular fraco pode pesar. Plano: opção de qualidade baixa.
- **Privacidade das fotos:** a foto da capa vira dado no servidor. Só pode ir para quem tem permissão.
- **Gestos do Telegram** podem atrapalhar a rolagem (ver Fase 3).
- **Virada do ano em fusos diferentes:** a cópia congelada precisa sair no fuso de cada pessoa, não no do servidor.
- **Mês sem 5 dias:** decidir se aparece alguma marca ("poucos registros") ou só fica sem carimbo.
- **Three.js r128** é de 2021. Funciona bem. Atualizar não exige refazer o 3D, mas muda luz e cores, então os cenários e a capa precisariam de reajuste e novo teste. Só vale se o 3D ficar pesado no Telegram.

---

## 10. Ordem sugerida

1. Decidir os itens que sobraram na seção 2 (cenários, virada do ano, acesso).
2. Página inicial com o cenário da estante.
3. Conferir Folhear e Dump (estado real) e terminar o que faltar.
4. Carimbo do dump e livro aberto de outra pessoa (duas páginas).
5. Lombada com nome e ano.
6. Fase 2: Worker + D1 (incluindo foto da capa e anos guardados).
7. Fase 3: Mini App do Telegram.
8. Fase 4: grupos, pedidos de acesso e a prateleira dos anos.
9. Fase 5: polimento.
