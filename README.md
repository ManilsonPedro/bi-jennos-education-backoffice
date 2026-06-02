# Bi.Jennos.Educatione — Frontend (Web)

Interface de gestão escolar — **Next.js 14 (App Router) · TypeScript · React 18**.

> Backend (API FastAPI) num repositório separado: `bi_jennos_educatione`.

## Arquitetura

- **App Router** com grupos de rota por perfil:
  `(admin)`, `(secretaria)`, `(docente)`, `(aluno)`, `(financeiro)`.
- **Proteção de rotas por role** em [middleware.ts](middleware.ts) (descodifica o JWT do cookie
  `access_token` e valida o perfil contra cada prefixo de rota).
- **Cliente HTTP centralizado** em [lib/api.ts](lib/api.ts) — comunica com o backend apenas via
  `NEXT_PUBLIC_API_URL` (desacoplamento total).
- **Componentes partilhados**: `AppShell` (layout por perfil) e `DataTable` (tabela genérica).

## Arranque rápido

```bash
cp .env.local.example .env.local   # define NEXT_PUBLIC_API_URL
npm install
npm run dev                        # http://localhost:3000
```

> Requer o backend a correr (por defeito em `http://localhost:8000/api/v1`).

## Qualidade

```bash
npx tsc --noEmit   # typecheck
npm run lint       # ESLint (next/core-web-vitals)
npm run build      # build de produção
```

## Estrutura

```
app/
├── (admin)/        dashboard, alunos
├── (secretaria)/   matriculas
├── (docente)/      avaliacoes
├── (aluno)/        notas
├── (financeiro)/   propinas
├── login/  sem-permissao/
└── layout.tsx  globals.css
components/shared/  # AppShell, DataTable
lib/                # api.ts, auth.ts
middleware.ts       # proteção de rotas por role
```

## Configuração

| Variável | Descrição | Defeito |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | `http://localhost:8000/api/v1` |

Roteiro de desenvolvimento: ver [SPRINTS.md](SPRINTS.md).
