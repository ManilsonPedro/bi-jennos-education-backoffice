# Bi Jennos — Backoffice (Next.js) · Guia de desenvolvimento local

## Pré-requisitos
- Node.js 20+
- A **API** a correr (ver `bi-jennos-education-api`) em http://localhost:8000

---

## 1. Setup (uma vez)
```bash
cd educatione-web
cp .env.local.example .env.local     # define NEXT_PUBLIC_API_URL
npm install
```
`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 2. Desenvolvimento
```bash
npm run dev          # http://localhost:3000 (hot reload)
```
Login de teste: **admin@bijennos.ao** / **admin123** (após `seed_admin` na API).

## 3. Verificações (antes de commit)
```bash
npx tsc --noEmit     # typecheck
npm run lint         # ESLint (next lint)
npm run build        # build de produção (valida tudo)
```

## 4. Produção / Docker
```bash
npm run build && npm run start       # serve o build em :3000
# ou imagem standalone:
docker build -t bijennos-web . && docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 bijennos-web
```

---

## Aliases úteis

### PowerShell  (cola em `$PROFILE`)
```powershell
function bjw    { Set-Location <REPO>\educatione-web; npm run dev }
function bjwck  { Set-Location <REPO>\educatione-web; npx tsc --noEmit; npm run lint }
function bjwbld { Set-Location <REPO>\educatione-web; npm run build }
```

### Bash  (cola em `~/.bashrc`)
```bash
alias bjw='cd <REPO>/educatione-web && npm run dev'
alias bjwck='cd <REPO>/educatione-web && npx tsc --noEmit && npm run lint'
alias bjwbld='cd <REPO>/educatione-web && npm run build'
```
> Substitui `<REPO>` pelo caminho onde clonaste o projeto.

---

## Fluxo full-stack rápido (2 terminais)
```
# Terminal 1 — API
cd bi_jennos_educatione && docker compose up -d db redis minio \
  && alembic upgrade head && python -m scripts.seed_admin \
  && uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd educatione-web && npm run dev
```
Abre http://localhost:3000 → entra com admin@bijennos.ao / admin123.
