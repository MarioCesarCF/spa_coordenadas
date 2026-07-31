# SPA Coordenadas — AGENTS.md

## Stack
- **Vite 8** + **React 19** (JSX, not TypeScript)
- **MUI v9** (`@mui/material` + `@emotion/react`) — green theme (`#2e7d32`)
- **axios** — instance in `src/api/axios.js` with auto-refresh interceptor
- **react-router-dom v7**

## Commands
| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 5173) |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Run tests | `npm test` (48 tests, 7 suites) |

## Environment

### Arquivos `.env` (frontend)

| Arquivo | Propósito | Git |
|---------|-----------|-----|
| `.env` | Dev: `VITE_API_URL=http://localhost:27017` | ✅ commitado |
| `.env.production` | Prod fallback: `VITE_API_URL=https://api-coordenadas-w03m.onrender.com` | ✅ commitado |
| `.env.local` | Override local (gitignorado) | ❌ gitignorado |
| `.env.example` | Template para novos devs | ✅ commitado |

**Ordem de precedência (Vite):** `.env.[mode].local` > `.env.[mode]` > `.env.local` > `.env`

Em produção (Render), a própria plataforma define `VITE_API_URL` como env var.

### CORS
- Frontend envia `Authorization: Bearer` header via request interceptor (não depende só de cookie)
- Backend deve ter `FRONTEND_URL` configurado com a origem do frontend
- Cookie `sameSite`: `none` em produção, `lax` em dev

## Architecture

**Dependency:** API backend URL vem de `VITE_API_URL` (env var ou `.env`).

**Context providers** (nesting order in `main.jsx`):
1. `BrowserRouter` → `AuthProvider` → `App` (inside App: `OrganizacaoProvider`)
2. `AuthContext` — user login state, localStorage tokens
3. `OrganizacaoContext` — organização do usuário logado, carregada via `GET /organizacao/me`

**Routing** (`src/App.jsx`):
- `/login` — public
- `/` — empresa list (auth required)
- `/empresa/nova` — create (auth required)
- `/empresa/:id/editar` — edit (auth required)
- `/organizacao` — org settings + member management (auth required)
- `*` — redirects to `/`

## Auth
- Tokens stored in **localStorage**: `accessToken`, `refreshToken`, `user`
- `accessToken` expires in 15min; `src/api/axios.js` auto-refreshes via `POST /usuario/refresh` on 401
- Login: `POST /usuario/login` with `{ email, password }` → returns `{ accessToken, refreshToken, user }`
- Logout: `POST /usuario/logout` clears localStorage

## Key conventions
- **Green primary color** (`#2e7d32`) — use MUI's `<Button color="primary">` consistently
- All API calls use the `api` instance from `src/api/axios.js` (not raw axios)
- EPA queries use `?name=`, `?document=`, `?city=`, `?numero_processo=`
- Tests run with `npm test` (7 suites, 48 tests)
- `OrganizacaoContext` provides `{ org, orgLoading, criarOrg, atualizarOrg, carregarOrg }`

## Cálculo Florestal (Fase 3)
- **Páginas:** `CalculoLista`, `CalculoForm`, `CalculoImportar`, `CalculoResultados`
- **Rotas:** `/calculos`, `/calculos/novo`, `/calculos/:id`, `/calculos/:id/importar`
- **Fluxo:** Criar projeto → Upload XLSX → Processar → Ver resultados (resumo, estatística, fitossociologia, distribuição diamétrica)
- **Link na sidebar:** "Cálculos" com ícone CalculateIcon, entre Documentos e Organização
- **Auth fix:** `AuthContext` agora salva `accessToken` e `refreshToken` no localStorage; logout limpa todos
- **Axios fix:** Request interceptor envia `Authorization: Bearer` header automaticamente; refresh usa `api.post` em vez de `axios.post` (corrige origem)
- `localStorage` keys: `accessToken`, `refreshToken`, `user`

## Related project
Backend API lives at `D:\meus_projetos\API_COORDENADAS` (separate repo). Start with `npm run dev` there first.

### 2026-07-31 — Adiciona logo Sylven (opção B) no header, login e favicon
- Criada logo SVG "Árvore com mira" (`public/logos/sylven-tree.svg`, `#2e7d32`) e componente `src/components/Logo.jsx` (SVG inline com `currentColor`)
- Logo branca no AppBar ao lado do nome, verde no drawer e no card de Login
- Favicon: index.html agora usa `/logos/sylven-tree.svg` (substitui PNG antigo)
- Demais conceitos mantidos em `public/logos/` + `public/preview-logos.html` para referência
- 48 testes passando; build OK

### 2026-07-31 — Migra system props diretas para `sx` (MUI v9)
- MUI v9 removou o suporte a system props diretas (`display="flex"`, `gap={2}`, `fontWeight`, `mb={3}`...): elas eram repassadas ao DOM como atributos inválidos e ignoradas
- Toda prop de estilo avulsa em Box, Stack, Grid, Typography, TextField foi movida para `sx={{...}}`
- Props legítimas de componente foram mantidas (`position` de AppBar/InputAdornment, `fontSize`/`color` de ícones, `direction`/`spacing` do Stack, `maxWidth`/`fullWidth`, `variant`/`color`/`align`/`gutterBottom` do Typography)
- 48 testes passando; build OK

### 2026-07-31 — Corrige 404 no F5 em produção (Vercel)
- Ao dar refresh em rotas como `/login`, o Vercel retornava 404 porque `BrowserRouter` usa URLs sem `#` e o servidor estático não encontrava o arquivo físico
- Criado `vercel.json` na raiz com rewrite `/(.*) → /index.html` (fallback SPA)
- Commit `2e168a9`; deploy automático no Vercel via GitHub

## Change documentation
Every major feature or structural change **must** be logged at the bottom of this file in reverse chronological order (newest first). Use the following format:

```markdown
### YYYY-MM-DD — Título breve da mudança
- O que foi feito e por quê
- Arquivos modificados (lista simplificada)
- Decisões técnicas relevantes
```

This keeps a lightweight changelog of the project's evolution embedded in the agents config.
