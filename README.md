# TriQuest Front-end

Interface estática do TriQuest, construída com HTML, CSS e JavaScript. O front-end não acessa o Supabase diretamente: todos os dados dinâmicos são recebidos em JSON pela API Flask.

## Responsabilidades

- apresentar as telas do jogo;
- cadastrar e autenticar por meio da API;
- exibir perguntas, dicas, resultados e progresso;
- manter o estado da rodada no navegador;
- registrar tentativas por meio da API.

## API utilizada

O front-end está configurado para consumir a API publicada na Vercel:

```javascript
const API_BASE_URL = "https://backend-matquest.vercel.app";
```

Para executar com um back-end local, altere temporariamente o valor para:

```javascript
const API_BASE_URL = "http://127.0.0.1:5000";
```

Não coloque credenciais do Supabase ou chaves privadas no front-end.

## Executar localmente

O projeto precisa ser servido por HTTP. Não abra os documentos diretamente pelo protocolo `file://`.

Uma opção usando Python é:

```powershell
cd frontend
python -m http.server 5500
```

Depois acesse `http://127.0.0.1:5500`.

Também é possível usar uma extensão de servidor estático, como Live Server.

## Páginas

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Página de apresentação |
| `entrar.html` | Autenticação |
| `cadastro.html` | Cadastro |
| `inicio.html` | Painel e progresso |
| `jogar.html` | Rodada de perguntas |
| `resultado.html` | Resultado da resposta ou rodada |
| `regras.html` | Instruções do jogo |
| `404.html` | Página não encontrada |
| `verificar-email.html` | Orientação após o cadastro |
| `email-confirmado.html` | Confirmação concluída ou link inválido |

## Estrutura

```text
frontend/
├── assets/       # Imagens e identidade visual
├── css/          # Estilos da aplicação
├── js/           # API, estado e regras do jogo
├── 404.html
├── cadastro.html
├── entrar.html
├── index.html
├── inicio.html
├── jogar.html
├── regras.html
├── resultado.html
├── .gitignore
└── README.md
```

## Publicação

Publique o conteúdo da pasta `frontend` em um serviço de hospedagem estática e configure o servidor para utilizar `404.html` como página de erro.
