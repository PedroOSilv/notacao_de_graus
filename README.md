# O Cofre Numérico da Música

Um site estático e interativo para ensinar iniciantes sobre a notação de graus musicais (Nashville Number System). O design utiliza a metáfora visual de um cofre para ajudar os alunos a "desvendar o código" da harmonia.

## Estrutura do Projeto

O repositório está estruturado para fácil implantação (deployment) com Vercel:

```text
.
├── public/                 # Arquivos estáticos servidos pelo Vercel
│   ├── index.html          # Marcação semântica e seções do site
│   ├── style.css           # Estilos e animações SVG
│   └── app.js              # Lógica do cofre e tabela de acordes interactiva
├── vercel.json             # Configurações de cache e segurança do Vercel
└── README.md               # Documentação do projeto
```

## Implantação no Vercel

Este projeto já está pronto para ser publicado no Vercel (Zero Config). 

1. Conecte este repositório no [Vercel](https://vercel.com/)
2. O Vercel detectará automaticamente a pasta `public/` como o seu diretório de saída e usará as configurações contidas em `vercel.json` (como regras de cache otimizada para o CSS/JS).
3. Clique em **Deploy**.

Nenhum comando de build ("Build Command") é necessário, visto que é um projeto estático em HTML/CSS/JS puros.

## Como Executar Localmente

Para testar localmente, você pode usar qualquer servidor HTTP local rodando a partir da raiz do repositório, ou entrar na pasta `public/` e abri-la.

Exemplo usando `npx`:
```bash
npx http-server public/ -p 8080
```
