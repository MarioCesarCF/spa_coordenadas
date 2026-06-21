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

## Architecture

**Dependency:** requires API backend running at `http://localhost:27017` (project `API_COORDENADAS`).

**Vite proxy** (`vite.config.js`): paths `/usuario` and `/empresa` are proxied to `localhost:27017`.

**Routing** (`src/App.jsx`):
- `/login` — public
- `/` — empresa list (auth required)
- `/empresa/nova` — create (auth required)
- `/empresa/:id/editar` — edit (auth required)
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
- No tests exist yet

## Related project
Backend API lives at `D:\meus_projetos\API_COORDENADAS` (separate repo). Start with `npm run dev` there first.

## Change documentation
Every major feature or structural change **must** be logged at the bottom of this file in reverse chronological order (newest first). Use the following format:

```markdown
### YYYY-MM-DD — Título breve da mudança
- O que foi feito e por quê
- Arquivos modificados (lista simplificada)
- Decisões técnicas relevantes
```

This keeps a lightweight changelog of the project's evolution embedded in the agents config.
