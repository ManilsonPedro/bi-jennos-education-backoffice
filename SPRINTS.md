# Bi.Jennos.Educatione — Plano de Sprints

Roteiro de desenvolvimento dividido em **7 partes** e **22 sprints**.
Legenda: ✅ concluído · 🔜 em curso · ⬜ por fazer

---

## PARTE I — Fundações

### ✅ Sprint 1 — Estrutura & Infra
- Estrutura de pastas (backend + frontend)
- `pyproject.toml`, `.env.example`, `Dockerfile`, `docker-compose.yml`
- Postgres 16 + Redis + MinIO via Docker

### ✅ Sprint 2 — Core & Segurança
- `config.py` (pydantic-settings), `security.py` (JWT + bcrypt), `exceptions.py`
- **Hierarquia de domínio `BaseEntity` → `BaseAuditEntity`** (espelha o padrão .NET):
  `inactive_at` (soft delete por data), `creation_user_id`/`update_user_id`,
  métodos `register_update` / `state_change` / `inactivate`, e `hybrid_property`
  `is_active` / `is_deleted`
- Sessões async (FastAPI) e síncrona (Celery)

### ✅ Sprint 3 — Modelos & Migration
- Modelos ORM **(todos herdam `BaseAuditEntity`)**: user (com `Builder`/`Update`),
  aluno, académico, avaliação, financeiro, certificado, extras, **base_file**
- Migration Alembic inicial + Row-Level Security

### ✅ Sprint 4 — Autenticação & RBAC
- `/auth/login`, `/auth/refresh`, `/auth/me`
- `require_roles` + aliases por perfil (7 roles)

---

## PARTE II — Núcleo Académico

### ✅ Sprint 5 — Alunos
- CRUD completo + paginação + pesquisa + soft delete

### ✅ Sprint 6 — Anos Académicos & Trimestres
- CRUD de ano académico (estados: configuração → aberto → encerrado)
- CRUD de trimestres + abertura/fecho

### ✅ Sprint 7 — Turmas & Disciplinas
- CRUD de turmas (capacidade, director de turma)
- CRUD de disciplinas (docente, carga horária)

### ✅ Sprint 8 — Matrículas
- Matrícula nova / rematrícula / transferência
- Validação de lotação e duplicados + aprovação

---

## PARTE III — Avaliação

### ✅ Sprint 9 — Notas
- Lançamento de notas com validators + bloqueio em trimestre fechado

### ✅ Sprint 10 — Frequência & Faltas
- Registo de frequência, faltas justificadas/injustificadas
- Reprovação por faltas

### ✅ Sprint 11 — Pautas & Médias
- Cálculo de média ponderada por disciplina/trimestre
- Pauta de turma + fecho de trimestre

---

## PARTE IV — Financeiro

### ✅ Sprint 12 — Propinas
- Geração mensal em massa para alunos activos

### ✅ Sprint 13 — Pagamentos & Relatórios
- Pagamento total/parcial + relatório (esperado/recebido/pendente/taxa)

---

## PARTE V — Certificados & Eventos

### ✅ Sprint 14 — Certificados
- Geração massiva via Celery + WeasyPrint + MinIO + progresso

### ✅ Sprint 15 — Palestras & Workshops
- CRUD + inscrições + certificados de participação

### ✅ Sprint 16 — Olimpíadas & Reuniões
- CRUD de olimpíadas (fases/disciplinas) e reuniões (actas)

---

## PARTE VI — Frontend Next.js 14

### ✅ Sprint 17 — Auth UI & Layouts
- Login, protecção de rotas, layouts por role

### ✅ Sprint 18 — Dashboards & Tabelas
- Dashboard admin + DataTable + listagem de alunos paginada

### ✅ Sprint 19 — Páginas de Domínio
- `AppShell` partilhado + layouts por perfil (secretaria, docente, financeiro, aluno)
- Matrículas (secretaria), Avaliações (docente), Propinas + relatório (financeiro),
  Notas/perfil (aluno) — todas ligadas à API com feedback de erro

---

## PARTE VII — Qualidade & Deploy

### ✅ Sprint 20 — Testes
- Unitários (validators, segurança) + **integração executável sobre SQLite**
  (tipo `GUID` portável): auth, CRUD de alunos, rotação de tokens, segurança, ficheiros

### ✅ Sprint 21 — Observabilidade & CI/CD
- Logging estruturado (structlog) + healthcheck `/health`
- GitHub Actions: backend (ruff + pytest com Postgres) + frontend (build)
- Config ruff pragmática, `.gitignore`, `.dockerignore`

### ✅ Sprint 22 — Hardening de Segurança
- Rotação + revogação de refresh tokens (`RefreshSession`, deteção de reutilização)
- Rate limiting por IP (429) + cabeçalhos de segurança
- RLS por tenant em runtime (`set_config('app.tenant_id')`, só PostgreSQL)

---

## Melhorias pós-sprint (entregues)

### ✅ Dashboard com dados reais
- `GET /dashboard/resumo` — contagens de alunos, turmas, matrículas activas,
  propinas pendentes, total recebido e certificados gerados
- Página de dashboard (admin) ligada a estes dados

### ✅ Inscrições em eventos
- `InscricaoEvento` (referência polimórfica `evento_id`+`evento_tipo`)
- `POST/GET /{evento}/inscricoes` e `DELETE /{evento}/inscricoes/{id}`
  com validação de vagas, nos 4 tipos de evento

### ✅ Endpoints de listagem
- `GET /matriculas` (filtro por aluno/turma)
- `GET /avaliacoes/notas` (por aluno/trimestre/disciplina)

### ✅ Cobertura total da especificação v1.0
- Páginas públicas (sem auth): `/cursos` e `/inscricao` (+ layout público)
- Pré-inscrição pública: `POST /public/pre-inscricoes` (lead) + listagem (admin/secretaria)
- Router dedicado `trimestres` (`POST /trimestres/{id}/fechar` — trancar trimestre)
- Frontend: `/admin/turmas`, `/admin/relatorios`, `/docente/turmas`
- **Correção RBAC**: route groups convertidos em segmentos reais (`/admin/*`,
  `/docente/*`…), fazendo o middleware de proteção por role funcionar de facto

---

## PARTE VIII — Conclusão da plataforma (pós-v1.0)

### ✅ Sprint 23 — Portal do Aluno: minhas notas
- Backend: `GET /avaliacoes/minhas-notas` (resolve o Aluno via utilizador autenticado)
- Frontend: página `/aluno/notas` a mostrar as notas reais

### ✅ Sprint 24 — Gestão de pré-inscrições (leads)
- Backend: `PATCH /public/pre-inscricoes/{id}` (atualizar estado)
- Frontend: página `/secretaria/pre-inscricoes` (listar + mudar estado)

### ✅ Sprint 25 — Certificados de participação (eventos)
- Backend: gerar certificados de participação para os inscritos de um evento
  (liga `InscricaoEvento` → `Certificado`)

### ✅ Sprint 26 — UI de certificados massivos (admin)
- Frontend: página `/admin/certificados` — geração massiva + polling de progresso

### ✅ Sprint 27 — Dados de demonstração
- Backend: `scripts/seed_demo.py` (ano académico, turma, alunos de exemplo)

### ✅ Sprint 28 — Containerização do frontend
- Frontend: `Dockerfile` multi-stage + `output: standalone` + `docker-compose.yml`

---

## PARTE IX — Prompt Master v3.0 (Clean Architecture + DDD)

> Expansão para plataforma 360°. RBAC dinâmico por permissões, UI dinâmica,
> e os módulos académicos/financeiros/RH completos.

### ✅ Sprint 29 — Auditoria 360°
- `AuditLog` + event listener SQLAlchemy (CREATE/UPDATE/DELETE automático)

### ✅ Sprint 30 — RBAC dinâmico por permissões
- `Grupo`, `Permissao`, `PermissaoGrupo`, `UserGrupo`, `AppUser.is_superuser`
- `require_perm(codigo)` + `UserService.get_permissoes_user` (mantém roles p/ compat)
- Routers `grupos`, `permissoes`; seed de permissões base

### ✅ Sprint 31 — UI dinâmica (módulos/menus/páginas)
- `Modulo`, `Menu`, `Pagina` + `GET /ui/menus` (árvore filtrada por permissão)
- Frontend: sidebar dinâmico a partir do endpoint

### ✅ Sprint 32 — Cursos & Classes
- `Curso`, `Classe` (turno, sala, director_turma, vagas) + endpoints

### ✅ Sprint 33 — Disciplinas chave & configuração de aprovação
- `ConfigDisciplinaChave`, `ConfigAprovacaoCurso`, `ConfigChaveHistorico`

### ✅ Sprint 34 — Inscrições (fluxo completo)
- `Inscricao` (criar→aprovar→rejeitar→converter em Aluno+Matricula)

### ✅ Sprint 35 — Avaliações: provas, critérios e histórico de notas
- `Prova`, `CriterioAvaliacao` (soma 100%), `NotasHistorico`

### ✅ Sprint 36 — Resultados: árvore de decisão do estado final
- `ResultadoAluno` + `ResultadoService` (frequência→chave total→recurso→média)

### ⬜ Sprint 37 — Pautas trimestrais e finais
- `Pauta` (assinatura, número de série, hash, PDF MinIO)

### ⬜ Sprint 38 — Horários & anti-colisão
- `Sala`, `Cronograma`, `ItemCronograma`, `Substituicao` (6 regras anti-colisão)

### ⬜ Sprint 39 — Conteúdos programáticos
- `UnidadeTematica`, `SumarioAula` + KPI de cumprimento

### ⬜ Sprint 40 — Multas, Tesouraria, Calendário e RH
- `Multa`/`Ocorrencia`, `CaixaDiaria`/`MovimentoCaixa`,
  `CalendarioAcademico`/`EventoCalendario`, `Funcionario`/`Contrato`/`ProcessamentoSalario`
