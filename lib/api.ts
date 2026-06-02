// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(error.detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ access_token: string; refresh_token: string; expires_in: number }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  refresh: (refresh_token: string) =>
    fetchAPI<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),
  me: () => fetchAPI('/auth/me'),
}

export interface PaginatedAlunos {
  items: Array<{
    id: string
    numero_aluno: string
    nome_completo: string
    data_nascimento: string
    email: string | null
    telefone: string | null
  }>
  total: number
  page: number
  size: number
  pages: number
}

export const alunosAPI = {
  listar: (page = 1, size = 20, search = '') =>
    fetchAPI<PaginatedAlunos>(
      `/alunos?page=${page}&size=${size}&search=${encodeURIComponent(search)}`,
    ),
  criar: (data: unknown) =>
    fetchAPI('/alunos', { method: 'POST', body: JSON.stringify(data) }),
  obter: (id: string) => fetchAPI(`/alunos/${id}`),
}

export const certificadosAPI = {
  gerarMassivo: (aluno_ids: string[], ano_academico_id: string, tipo: string) =>
    fetchAPI<{ task_id: string; total: number; estado: string }>(
      '/certificados/gerar-massivo',
      {
        method: 'POST',
        body: JSON.stringify({ aluno_ids, ano_academico_id, tipo }),
      },
    ),
  progresso: (task_id: string) =>
    fetchAPI<{ estado: string; total?: number; processados?: number; percentagem?: number }>(
      `/certificados/progresso/${task_id}`,
    ),
}

// ── Dashboard ──────────────────────────────────────────────
export interface DashboardResumo {
  total_alunos: number
  total_turmas: number
  matriculas_activas: number
  propinas_pendentes: number
  total_recebido: string
  certificados_gerados: number
}

export const dashboardAPI = {
  resumo: () => fetchAPI<DashboardResumo>('/dashboard/resumo'),
}

// ── Academico ──────────────────────────────────────────────
export interface AnoAcademico {
  id: string
  designacao: string
  data_inicio: string
  data_fim: string
  estado: string
}
export interface Turma {
  id: string
  nome: string
  ano_academico_id: string
  max_alunos: number
}

export const academicoAPI = {
  listarAnos: () => fetchAPI<AnoAcademico[]>('/anos-academicos'),
}

export const turmasAPI = {
  listar: (anoId?: string) =>
    fetchAPI<Turma[]>(`/turmas${anoId ? `?ano_academico_id=${anoId}` : ''}`),
  criar: (data: {
    nome: string
    ano_academico_id: string
    max_alunos?: number
    director_turma_id?: string
  }) => fetchAPI<Turma>('/turmas', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Publico (sem autenticacao) ─────────────────────────────
export interface PreInscricao {
  id: string
  nome_completo: string
  telefone: string
  email: string | null
  curso_interesse: string | null
  estado: string
}

export const publicAPI = {
  preInscricao: (data: {
    nome_completo: string
    telefone: string
    email?: string
    curso_interesse?: string
    mensagem?: string
  }) =>
    fetchAPI<{ id: string; estado: string }>('/public/pre-inscricoes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listarPreInscricoes: () => fetchAPI<PreInscricao[]>('/public/pre-inscricoes'),
  actualizarEstado: (id: string, estado: string) =>
    fetchAPI<PreInscricao>(`/public/pre-inscricoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
}

// ── Matriculas ─────────────────────────────────────────────
export const matriculasAPI = {
  criar: (data: {
    aluno_id: string
    turma_id: string
    ano_academico_id: string
    tipo?: string
  }) => fetchAPI('/matriculas', { method: 'POST', body: JSON.stringify(data) }),
  aprovar: (id: string) =>
    fetchAPI(`/matriculas/${id}/aprovar`, { method: 'POST' }),
}

// ── Avaliacoes ─────────────────────────────────────────────
export interface Nota {
  id: string
  aluno_id: string
  tipo: string
  nota: string
  nota_maxima: string
  percentagem: string
}

export const avaliacoesAPI = {
  lancarNota: (data: {
    aluno_id: string
    disciplina_id: string
    trimestre_id: string
    tipo: string
    nota: string
    nota_maxima?: string
    descricao?: string
  }) => fetchAPI('/avaliacoes/notas', { method: 'POST', body: JSON.stringify(data) }),
  minhasNotas: () => fetchAPI<Nota[]>('/avaliacoes/minhas-notas'),
}

// ── Financeiro ─────────────────────────────────────────────
export interface RelatorioFinanceiro {
  total_esperado: string
  total_recebido: string
  total_pendente: string
  total_vencido: string
  taxa_cobranca: number
}

export const financeiroAPI = {
  gerarMensal: (data: {
    ano_academico_id: string
    mes: number
    ano: number
    valor: string
    data_vencimento: string
  }) =>
    fetchAPI<{ criadas: number; mes: number; ano: number }>(
      '/financeiro/propinas/gerar-mensal',
      { method: 'POST', body: JSON.stringify(data) },
    ),
  pagar: (
    propinaId: string,
    data: { valor_pago: string; tipo_pagamento: string; referencia_pagamento?: string },
  ) =>
    fetchAPI(`/financeiro/propinas/${propinaId}/pagar`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  relatorio: (anoId: string) =>
    fetchAPI<RelatorioFinanceiro>(`/financeiro/relatorio?ano_academico_id=${anoId}`),
}
