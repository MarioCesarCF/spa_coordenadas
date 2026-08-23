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

### 2026-08-22 — Papel superadmin, painel de administração e impersonação
- **Hierarquia de papéis:** `superadmin` (equipe interna, visão global) → `admin` da org → `membro`. Menu "Administração" no Layout aparece só para superadmin
- **Novo componente `AdminRoute`** (`src/components/AdminRoute.jsx`): protege `/admin`, redireciona não-superadmin para `/`
- **Painel admin** (`/admin`): `pages/admin/AdminPage.jsx` com 3 abas — Organizações (lista com filtros + contadores de uso, criação de org + login administrativo = onboarding de cliente, edição de plano/status/limites), Usuários (lista global, editar papel/dados, remover, "Entrar como"), Logs de Auditoria (filtros por entidade/ação/org/período + paginação + detalhe expansível do JSON)
- **Impersonação:** `AuthContext` ganhou `impersonar(usuarioId)` / `encerrarImpersonacao()` / `impersonando`; tokens do superadmin são salvos em `su_*` no localStorage antes de assumir a sessão do alvo; banner laranja abaixo do AppBar com botão "Encerrar impersonação"; sessão do alvo é revogada ao encerrar
- **`OrganizacaoContext`:** recarrega a org quando `user._id` muda (troca de sessão na impersonação); `criarOrg` removido — criação de organização passou a ser exclusiva do painel superadmin (`POST /organizacao` agora é 403 para usuários comuns)
- **`OrganizacaoPage`:** formulário self-service de criação substituído por mensagem informativa ("organizações são criadas pelo time Sylven na contratação"); tabela de membros ganhou botão promover/rebaixar (`PATCH /organizacao/membros/:id`), ações ocultas para o próprio usuário
- Backend correspondente: rotas `/admin/*` (superadmin), papel `superadmin` no enum, `escopoOrganizacao` para visão cross-org, AuditLog com `login/logout/impersonate` + campo `organizacao`
- 54 testes passando; build OK

### 2026-07-31 — Cálculos e Documentos visíveis em todos os planos (modo leitura)
- Menus "Cálculos" e "Documentos" agora aparecem em todos os planos; sem o recurso, o usuário só visualiza e vê mensagem de upgrade
- Backend: `requireCalculos` passou a bloquear apenas ações (POST criar, importar, processar e DELETE); GET de lista/projeto/resultados ficou liberado (ver `calculo.route.js`)
- Frontend: `CalculoLista` mostra banner de upgrade e desabilita "Novo Projeto", importar e remover; `CalculoResultados` oculta "Processar"/"Importar dados" e mostra a mensagem
- Rotas de ação (`/calculos/novo`, `/calculos/:id/importar`, `/calculos/:id/editar`) seguem protegidas por `ProFeatureGuard`
- `DocumentoLista`/`DocumentoForm` seguem bloqueando upload quando `storage_gb <= 0` (mensagem já existente)
- 54 testes passando; build OK

### 2026-07-31 — Enforcement de limites de plano
- Backend passou a bloquear (403) cálculos sem `config_limites.calculos_habilitados`, empresas acima de `max_empresas` e uploads sem `storage_gb`; plano free agora realmente não tem cálculos nem uploads
- Frontend: item "Cálculos" no menu aparece apenas se o plano liberar (`Layout.jsx`); rotas `/calculos*` protegidas pelo novo `ProFeatureGuard` (`App.jsx`)
- `EmpresaLista`: botões "Nova Empresa"/"Importar" desabilitados quando `empresas.length >= max_empresas` (com alerta)
- `DocumentoLista`/`DocumentoForm`: "Novo Documento" e upload desabilitados quando `storage_gb <= 0`
- `OrganizacaoPage`: card "Limites do plano" agora mostra uso real (ex.: "Empresas: 3/5"); botão "Alterar Plano" (já existente) atualiza `config_limites` via `PATCH /organizacao/me`
- 54 testes passando; build OK

### 2026-07-31 — Tema dark/light + toggle no header
- Criado `src/contexts/ThemeContext.jsx`: `ThemeProvider`, `useThemeMode` e `lightTheme`; modo persistido em `localStorage` (`sylven_theme_mode`)
- `main.jsx` envolve a app com o ThemeProvider; `App.jsx` mantém `CssBaseline` e força tema **light** apenas na rota `/login` (será redesenhada à parte)
- Toggle (DarkMode/LightMode) no AppBar; toda a app segue o tema via MUI
- Cores fixas adaptadas: removido `background-color` fixo do `index.css` (CssBaseline cuida), `EsqueciSenha`/`RedefinirSenha` usam `background.default`, botão do mapa em `EmpresaForm` usa `background.paper`/`action.hover`
- Removidos `sylven-pin.svg`, `sylven-monogram.svg` e `preview-logos.html` (referência não usada)
- 48 testes passando; build OK

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

## Pendências — testes manuais

### Roteiro de teste E2E do fluxo superadmin/organizações (pendente — 2026-08-22)
Ambiente local: backend `http://localhost:27017` + frontend `http://localhost:5173` (`npm run dev` em ambos). Superadmin: `admin@sylven.com.br` / `Admin@123456`.

1. Login como superadmin → menu **Administração** visível no topo
2. Aba **Organizações** → "Nova Organização" → preencher cliente + login administrativo → conferir credenciais exibidas no diálogo de sucesso
3. Logout → entrar com o login administrativo da org criada → Organização → Membros: cadastrar membros, promover/rebaixar papéis
4. Como admin/membro da org, cadastrar empresas/documentos → confirmar que outra organização NÃO enxerga esses dados
5. Voltar ao superadmin → aba **Usuários** → ícone ⇄ ("Entrar como") para impersonar usuário da org → conferir banner laranja e botão "Encerrar impersonação"
6. Aba **Logs** → verificar registros de login, criação de org, convite de membro e impersonação
7. Conferir limites do plano: criar empresa além do limite free e validar bloqueio (403)

## Change documentation
Every major feature or structural change **must** be logged at the bottom of this file in reverse chronological order (newest first). Use the following format:

```markdown
### YYYY-MM-DD — Título breve da mudança
- O que foi feito e por quê
- Arquivos modificados (lista simplificada)
- Decisões técnicas relevantes
```

This keeps a lightweight changelog of the project's evolution embedded in the agents config.

### 2026-08-23 — Corrige tela em branco do painel admin + "Lembrar-me" no login
- **Bug raiz (tela em branco em /admin):** `AdminRoute` retornava `<Outlet />`, mas era usado como wrapper com children em `App.jsx` (`<AdminRoute><AdminPage /></AdminRoute>`) — `<Outlet />` renderiza só rotas aninhadas, então o painel nunca montava (tela vazia sem erro). Corrigido para renderizar `children`; removido import `Outlet`
- **Bug:** `AdminOrganizacoes.jsx`, `AdminLogs.jsx` e `AdminUsuarios.jsx` usavam componentes sem importar (`IconButton`, `Alert`, `useAuth`) — crash de render ("Element type is invalid" / ReferenceError) assim que as listas carregassem; imports corrigidos
- **Bug:** `AdminPage.jsx` renderizava `<Tab>` soltos sem o wrapper `<Tabs>` (sem indicador/estilo de seleção); migrado para `<Tabs value onChange>`
- **Novo teste de fumaça** (`__tests__/pages/admin/AdminPage.test.jsx`): monta o painel completo com API mockada (mesmos formatos do backend) e navega pelas 3 abas — pega qualquer crash de render nos componentes admin
- **Novo teste de regressão** (`__tests__/components/AdminRoute.test.jsx`): cobre superadmin→children, admin/membro→redirect `/`, não autenticado→redirect `/login` e loading
- Mocks do MUI no `vitest.setup.jsx` ganharam `Stack`, `Tabs`/`Tab` (com value por índice), `Collapse`, `Checkbox`, `FormControlLabel`; `TextField` agora suporta variante `select`
- **Feature:** checkbox "Lembrar-me" no Login (`pages/Login.jsx`) — salva apenas o **email** no localStorage (`sylven_lembrar_email`), nunca a senha; pré-preenche email e estado do checkbox na próxima visita; 3 novos testes em `Login.test.jsx`
- **ErrorBoundary** (`components/ErrorBoundary.jsx`) envolvendo a app em `main.jsx`: crash de render agora mostra card com a mensagem de erro em vez de página em branco
- `OrganizacaoContext` não chama mais `GET /organizacao/me` para superadmin (evita 404 esperado no network)
- 65 testes passando; build OK

### 2026-08-23 — Fundo fotográfico na tela de login + imagens otimizadas
- `pages/Login.jsx`: Box externo com `backgroundImage` cobrindo toda a tela (`cover`/`center`) e Card do formulário branco sólido com `boxShadow: 8`
- Fotos de câmera do usuário eram pesadas demais para web (ex.: `tela_login_1.jpg` = 19,8 MB em 5616×3744); criadas versões `_web.jpg` via System.Drawing (resize p/ 1600–1920px + JPEG q70–78): ~200–850 KB cada
- Teste de glassmorphism (card translúcido + `backdrop-filter: blur(12px)`) foi implementado e **revertido** por decisão do usuário (não gostou do blur)
- Adicionadas 3 fotos de plantio de eucalipto do Wikimedia Commons (licenças CC BY), otimizadas: `fundo_eucalipto_1_web.jpg` ("Ouro Verde", CC BY 2.0), `fundo_eucalipto_2_web.jpg` (Belo Oriente MG, CC BY 3.0), `fundo_eucalipto_3_web.jpg` (Reflorestamento ES, CC BY 3.0 br)
- Fundo em uso no momento: `tela_login_6.avif` (foto própria do usuário); escolha final da imagem ficou pendente para o futuro
- Créditos/atribuições obrigatórias das licenças registrados em `public/CREDITOS_IMAGENS.txt`; se uma imagem CC for mantida em produção, incluir crédito no app
- 65 testes passando
