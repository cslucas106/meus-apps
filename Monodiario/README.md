# Monodiário (Fase 1)

Plano completo em `plano.md`. Esta pasta é a Fase 1: tudo roda no navegador, com localStorage.

## Antes de abrir
1. Baixe o Three.js **r128** (`three.min.js`) e coloque em `js/vendor/three.min.js`.
   Sem o arquivo, o site tenta o CDN (precisa de internet).
2. Os módulos JS e o `fetch` exigem servidor (abrir o `index.html` com duplo clique não funciona):
   `python3 -m http.server 8000` e abra `http://localhost:8000`.
   No GitHub Pages funciona direto.

## Testes
- `?hoje=2026-11-30` muda o "hoje" (testa a trava do dia).
- `?dev` mostra o botão "Dados falsos" (preenche ~90 dias anteriores).
- Exemplo: `index.html?hoje=2026-11-30&dev`

## O que já funciona
`data/frases.json` (5 frases x 12 sentimentos), `clock.js`, `auth.js`, `api.js` (local), roteador por hash,
tela Hoje com carimbo e trava, Livro 3D (`js/livro3d.js`) e Capa com salvamento automático.
Folhear, Estante e Dump aparecem como "em breve".
