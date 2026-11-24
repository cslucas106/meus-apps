# meus-apps

Repositório dos aplicativos criados com o **[PocketCode AI](https://github.com/cslucas106)**, o agente de código para o navegador do celular. Cada app vive na sua própria pasta e é publicado pelo **GitHub Pages**.

Com o GitHub Pages ativo, o site fica em **https://cslucas106.github.io/meus-apps/**, com uma página inicial que lista todos os apps.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | Página inicial gerada pelo PocketCode (*Arquivos → Site → 📋 Gerar página inicial*). Lista as pastas que têm um `index.html`. |
| `<nome-do-app>/` | Um app por pasta: `index.html`, `style.css`, os arquivos JavaScript e, se o app for instalável, `manifest.webmanifest`, ícones e `sw.js`. |
| `.github/workflows/pocketcode.yml` | Verificação usada pelo botão **▶ Rodar verificação** do app: confere a sintaxe dos `.js`, roda `lint`, `test` e `build` quando há `package.json` e executa os arquivos `*.test.js`. Só roda quando o app manda. |

## Como os apps chegam aqui

1. No PocketCode, escolha este repositório no modo 🧑‍💻 Código e peça o app (ex.: "crie um jogo da memória na pasta `memoria/`").
2. Revise com **👁 Ver prévia** e **🔍 Ver mudanças**.
3. Envie por **Commit** ou **Branch + PR**. Com commit direto numa pasta nova, o app oferece **📋 Adicionar à página inicial**.
4. O site atualiza cerca de 1 minuto depois.

## Boas práticas

- Mantenha cada app na sua pasta: a raiz é da página inicial, e o modo 🔁 *Até terminar* recusa arquivos de app na raiz.
- Prefira **Branch + PR** para mudanças grandes e aceite só depois de conferir a prévia.
- Não coloque chaves, senhas ou tokens nos arquivos: este repositório é público.

## Licença

Cada app pertence a quem o criou. Na falta de indicação em contrário, o código pode ser reutilizado nos termos da licença MIT.
