// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://bijennos-api.onrender.com/api/v1'

function readToken(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|; )access_token=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : null
}

export async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = readToken()
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(error.detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface MeDetalhado {
  id: string
  nome_completo: string
  email: string
  role: string
  numero_aluno: string | null
  curso: string | null
  classe: string | null
  ano_academico: string | null
  disciplinas: Array<{ id: string; nome: string; turma_nome: string | null }> | null
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
  me: () => fetchAPI<{ id: string; email: string; nome_completo: string; role: string }>('/auth/me'),
  meDetalhado: () => fetchAPI<MeDetalhado>('/auth/me-detalhado'),
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
  actualizar: (id: string, data: unknown) =>
    fetchAPI(`/alunos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivar: (id: string, motivo: string) =>
    fetchAPI(`/alunos/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activar: (id: string, motivo: string) =>
    fetchAPI(`/alunos/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
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
export interface Trimestre {
  id: string
  ano_academico_id: string
  numero: number
  designacao: string | null
  data_inicio: string
  data_fim: string
  estado: string
  data_fecho: string | null
}
export interface Turma {
  id: string
  nome: string
  ano_academico_id: string
  max_alunos: number
}

export const academicoAPI = {
  listarAnos: () => fetchAPI<AnoAcademico[]>('/anos-academicos'),
  criarAno: (data: { designacao: string; data_inicio: string; data_fim: string }) =>
    fetchAPI<AnoAcademico>('/anos-academicos', { method: 'POST', body: JSON.stringify(data) }),
  actualizarAno: (id: string, data: { designacao?: string; data_inicio?: string; data_fim?: string }) =>
    fetchAPI<AnoAcademico>(`/anos-academicos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivarAno: (id: string, motivo: string) =>
    fetchAPI<AnoAcademico>(`/anos-academicos/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activarAno: (id: string, motivo: string) =>
    fetchAPI<AnoAcademico>(`/anos-academicos/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  abrirAno: (id: string) =>
    fetchAPI<AnoAcademico>(`/anos-academicos/${id}/abrir`, { method: 'POST' }),
  encerrarAno: (id: string) =>
    fetchAPI<AnoAcademico>(`/anos-academicos/${id}/encerrar`, { method: 'POST' }),
  listarTrimestres: (anoId: string) =>
    fetchAPI<Trimestre[]>(`/anos-academicos/${anoId}/trimestres`),
  criarTrimestre: (anoId: string, data: { numero: number; designacao?: string; data_inicio: string; data_fim: string }) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres`, { method: 'POST', body: JSON.stringify(data) }),
  actualizarTrimestre: (anoId: string, triId: string, data: { designacao?: string; data_inicio?: string; data_fim?: string }) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres/${triId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivarTrimestre: (anoId: string, triId: string, motivo: string) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres/${triId}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activarTrimestre: (anoId: string, triId: string, motivo: string) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres/${triId}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  fecharTrimestre: (anoId: string, triId: string, motivo?: string) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres/${triId}/fechar`, { method: 'POST', body: JSON.stringify({ motivo: motivo ?? '' }) }),
  reabrirTrimestre: (anoId: string, triId: string, motivo: string) =>
    fetchAPI<Trimestre>(`/anos-academicos/${anoId}/trimestres/${triId}/reabrir`, { method: 'POST', body: JSON.stringify({ motivo }) }),
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
  actualizar: (id: string, data: { nome?: string; max_alunos?: number }) =>
    fetchAPI<Turma>(`/turmas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivar: (id: string, motivo: string) =>
    fetchAPI<Turma>(`/turmas/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activar: (id: string, motivo: string) =>
    fetchAPI<Turma>(`/turmas/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  listarDisciplinas: (turmaId: string) =>
    fetchAPI<{ id: string; nome: string; turma_id: string; docente_id: string | null; carga_horaria: number | null }[]>(`/turmas/${turmaId}/disciplinas`),
  criarDisciplina: (turmaId: string, data: { nome: string; carga_horaria?: number }) =>
    fetchAPI(`/turmas/${turmaId}/disciplinas`, { method: 'POST', body: JSON.stringify(data) }),
  actualizarDisciplina: (turmaId: string, disciplinaId: string, data: { nome?: string; carga_horaria?: number }) =>
    fetchAPI(`/turmas/${turmaId}/disciplinas/${disciplinaId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivarDisciplina: (turmaId: string, disciplinaId: string, motivo: string) =>
    fetchAPI(`/turmas/${turmaId}/disciplinas/${disciplinaId}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activarDisciplina: (turmaId: string, disciplinaId: string, motivo: string) =>
    fetchAPI(`/turmas/${turmaId}/disciplinas/${disciplinaId}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
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

// ── Multas ────────────────────────────────────────────────
export interface Multa {
  id: string
  numero_multa: string
  aluno_id: string
  tipo: string
  estado: string
  valor: string
  valor_pago: string
}

export const multasAPI = {
  porAluno: (alunoId: string) =>
    fetchAPI<Multa[]>(`/multas/aluno/${alunoId}`),
  emitir: (data: { aluno_id: string; tipo: string; valor: string; descricao?: string }) =>
    fetchAPI<Multa>('/multas', { method: 'POST', body: JSON.stringify(data) }),
  pagar: (id: string, valor_pago: string) =>
    fetchAPI<Multa>(`/multas/${id}/pagar`, {
      method: 'POST',
      body: JSON.stringify({ valor_pago }),
    }),
  isentar: (id: string, motivo: string) =>
    fetchAPI<Multa>(`/multas/${id}/isentar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),
  gerarAtraso: () =>
    fetchAPI<{ multas_geradas: number }>('/multas/gerar-atraso', { method: 'POST' }),
}

// ── Tesouraria ────────────────────────────────────────────
export interface RelatorioCaixa {
  caixa_id: string
  data: string
  estado: string
  saldo_abertura: string
  total_entradas: string
  total_saidas: string
  saldo_actual: string
}

export const tesourariaAPI = {
  abrir: (saldo_abertura: string) =>
    fetchAPI('/tesouraria/caixa/abrir', {
      method: 'POST',
      body: JSON.stringify({ saldo_abertura }),
    }),
  fechar: () => fetchAPI('/tesouraria/caixa/fechar', { method: 'POST' }),
  hoje: () => fetchAPI<{ aberta: boolean; id?: string; saldo_abertura?: string; total_entradas?: string; total_saidas?: string; estado?: string }>('/tesouraria/caixa/hoje'),
  movimento: (data: { tipo: string; categoria: string; valor: string; descricao?: string }) =>
    fetchAPI('/tesouraria/movimentos', { method: 'POST', body: JSON.stringify(data) }),
  relatorioDiario: () => fetchAPI<RelatorioCaixa>('/tesouraria/relatorio-diario'),
}

// ── Calendario ────────────────────────────────────────────
export interface EventoCalendario {
  id: string
  tipo: string
  titulo: string
  data_inicio: string
  data_fim: string | null
}

export const calendarioAPI = {
  criar: (ano_academico_id: string, designacao?: string) =>
    fetchAPI<{ id: string }>('/calendario', {
      method: 'POST',
      body: JSON.stringify({ ano_academico_id, designacao }),
    }),
  eventos: (calendarioId: string) =>
    fetchAPI<EventoCalendario[]>(`/calendario/${calendarioId}/eventos`),
  adicionarEvento: (
    calendarioId: string,
    data: { tipo: string; titulo: string; data_inicio: string; data_fim?: string; descricao?: string; classe_id?: string },
  ) =>
    fetchAPI<EventoCalendario>(`/calendario/${calendarioId}/eventos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  publicar: (calendarioId: string) =>
    fetchAPI(`/calendario/${calendarioId}/publicar`, { method: 'POST' }),
}

// ── RH ────────────────────────────────────────────────────
export interface Funcionario {
  id: string
  nome_completo: string
  categoria_profissional: string | null
  salario_base: string
}

export const rhAPI = {
  listarFuncionarios: () => fetchAPI<Funcionario[]>('/rh/funcionarios'),
  criarFuncionario: (data: {
    nome_completo: string
    bi_numero?: string
    nif?: string
    data_admissao?: string
    categoria_profissional?: string
    vinculo?: string
    salario_base: string
  }) =>
    fetchAPI<Funcionario>('/rh/funcionarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  actualizarFuncionario: (id: string, data: {
    nome_completo?: string
    bi_numero?: string
    nif?: string
    categoria_profissional?: string
    vinculo?: string
    salario_base?: string
  }) =>
    fetchAPI<Funcionario>(`/rh/funcionarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  inactivarFuncionario: (id: string, motivo: string) =>
    fetchAPI(`/rh/funcionarios/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activarFuncionario: (id: string, motivo: string) =>
    fetchAPI(`/rh/funcionarios/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  criarContrato: (
    funcionarioId: string,
    data: { tipo: string; data_inicio: string; data_fim?: string; valor_hora_ou_mes: string; observacoes?: string },
  ) =>
    fetchAPI(`/rh/funcionarios/${funcionarioId}/contratos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  processarMensal: (mes: number, ano: number) =>
    fetchAPI<{ processados: number; mes: number; ano: number }>(
      '/rh/salarios/processar-mensal',
      { method: 'POST', body: JSON.stringify({ mes, ano }) },
    ),
}

// ── UI dinamica ───────────────────────────────────────────
export interface PaginaMenu {
  id: string
  nome: string
  rota: string
  icone: string | null
}
export interface MenuTree {
  id: string
  nome: string
  icone: string | null
  paginas: PaginaMenu[]
}
export interface ModuloTree {
  id: string
  nome: string
  icone: string | null
  menus: MenuTree[]
}

export const uiAPI = {
  menus: () => fetchAPI<ModuloTree[]>('/ui/menus'),
}

// ── Pautas ────────────────────────────────────────────────
export interface Pauta {
  id: string
  numero_serie: string
  tipo: string
  estado: string
  pdf_url?: string | null
}
export const pautasAPI = {
  gerarTrimestral: (data: { classe_id: string; disciplina_id: string; trimestre_id: string }) =>
    fetchAPI<Pauta>('/pautas/gerar-trimestral', { method: 'POST', body: JSON.stringify(data) }),
  gerarFinal: (data: { classe_id: string; ano_academico_id: string }) =>
    fetchAPI<Pauta>('/pautas/gerar-final', { method: 'POST', body: JSON.stringify(data) }),
  validar: (id: string) => fetchAPI<Pauta>(`/pautas/${id}/validar`, { method: 'POST' }),
  publicar: (id: string) => fetchAPI<Pauta>(`/pautas/${id}/publicar`, { method: 'POST' }),
}

// ── Resultados ────────────────────────────────────────────
export interface ResultadoAluno {
  aluno_id: string
  ano_academico_id: string
  estado_final: string
  media_final?: string | null
  motivo?: string | null
}
export const resultadosAPI = {
  calcularLote: (anoId: string) =>
    fetchAPI<{ ano_academico_id: string; alunos_processados: number }>(
      `/resultados/calcular/${anoId}`, { method: 'POST' },
    ),
  obter: (alunoId: string, anoId: string) =>
    fetchAPI<ResultadoAluno>(`/resultados/${alunoId}/${anoId}`),
  calcular: (alunoId: string, anoId: string) =>
    fetchAPI<ResultadoAluno>(`/resultados/${alunoId}/${anoId}/calcular`, { method: 'POST' }),
  confirmar: (alunoId: string, anoId: string) =>
    fetchAPI<ResultadoAluno>(`/resultados/${alunoId}/${anoId}/confirmar`, { method: 'POST' }),
}

// ── Horarios ──────────────────────────────────────────────
export interface Sala { id: string; nome: string; capacidade?: number | null }
export interface ItemCronograma {
  id: string
  cronograma_id: string
  disciplina_id: string
  docente_id: string
  sala_id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
}
export const horariosAPI = {
  salas: () => fetchAPI<Sala[]>('/horarios/salas'),
  criarSala: (data: { nome: string; capacidade?: number }) =>
    fetchAPI<Sala>('/horarios/salas', { method: 'POST', body: JSON.stringify(data) }),
  actualizarSala: (id: string, data: { nome?: string; capacidade?: number; tipo?: string }) =>
    fetchAPI<Sala>(`/horarios/salas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivarSala: (id: string, motivo: string) =>
    fetchAPI<Sala>(`/horarios/salas/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  criarCronograma: (data: { classe_id: string; ano_academico_id: string }) =>
    fetchAPI<{ id: string }>('/horarios/cronogramas', { method: 'POST', body: JSON.stringify(data) }),
  itens: (cronogramaId: string) =>
    fetchAPI<ItemCronograma[]>(`/horarios/cronogramas/${cronogramaId}/itens`),
  adicionarItem: (cronogramaId: string, data: unknown) =>
    fetchAPI<ItemCronograma>(`/horarios/cronogramas/${cronogramaId}/itens`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  inactivarItem: (id: string, motivo: string) =>
    fetchAPI<ItemCronograma>(`/horarios/itens/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
}

// ── Conteudos programaticos ───────────────────────────────
export interface Unidade {
  id: string; titulo: string; ordem: number; carga_horaria: number
}
export interface Sumario {
  id: string; titulo: string; data_aula: string; unidade_id: string | null
}
export interface Cumprimento {
  total_unidades: number; total_sumarios: number; percentagem: number
}
export const conteudosAPI = {
  unidades: (disciplinaId: string, anoId: string) =>
    fetchAPI<Unidade[]>(`/conteudos/unidades?disciplina_id=${disciplinaId}&ano_academico_id=${anoId}`),
  criarUnidade: (data: unknown) =>
    fetchAPI<Unidade>('/conteudos/unidades', { method: 'POST', body: JSON.stringify(data) }),
  registarSumario: (data: unknown) =>
    fetchAPI<Sumario>('/conteudos/sumarios', { method: 'POST', body: JSON.stringify(data) }),
  cumprimento: (disciplinaId: string, anoId: string) =>
    fetchAPI<Cumprimento>(`/conteudos/cumprimento/${disciplinaId}/${anoId}`),
}

// ── Grupos / Permissoes ───────────────────────────────────
export interface Grupo { id: string; nome: string; descricao: string | null }
export interface Permissao { id: string; codigo: string; descricao: string | null; modulo: string | null }

export const gruposAPI = {
  listar: () => fetchAPI<Grupo[]>('/grupos'),
  criar: (nome: string, descricao?: string) =>
    fetchAPI<Grupo>('/grupos', { method: 'POST', body: JSON.stringify({ nome, descricao }) }),
  definirPermissoes: (grupoId: string, codigos: string[]) =>
    fetchAPI<Grupo>(`/grupos/${grupoId}/permissoes`, {
      method: 'PATCH', body: JSON.stringify({ codigos }),
    }),
  associarUser: (user_id: string, grupo_id: string) =>
    fetchAPI('/grupos/associar-user', {
      method: 'POST', body: JSON.stringify({ user_id, grupo_id }),
    }),
}
export const permissoesAPI = {
  listar: () => fetchAPI<Permissao[]>('/permissoes'),
}

// ── Auditoria ─────────────────────────────────────────────
export interface AuditLog {
  id: string
  tabela: string
  registo_id: string
  accao: string
  user_id: string | null
  created_at: string
}
// ── Inscricoes ────────────────────────────────────────────
export interface Inscricao {
  id: string
  numero_inscricao: string
  nome_candidato: string
  data_nascimento: string
  estado: string
  tipo: string
  classe_id: string | null
  ano_academico_id: string
  aluno_id: string | null
  matricula_id: string | null
}
export const inscricoesAPI = {
  listar: (estado?: string) =>
    fetchAPI<Inscricao[]>(`/inscricoes${estado ? `?estado=${estado}` : ''}`),
  criar: (data: {
    nome_candidato: string
    data_nascimento: string
    ano_academico_id: string
    classe_id?: string
    bi_numero?: string
    telefone?: string
    email?: string
    enc_nome?: string
    enc_telefone?: string
    tipo?: string
  }) => fetchAPI<Inscricao>('/inscricoes', { method: 'POST', body: JSON.stringify(data) }),
  aprovar: (id: string) =>
    fetchAPI<Inscricao>(`/inscricoes/${id}/aprovar`, { method: 'POST' }),
  rejeitar: (id: string, motivo: string) =>
    fetchAPI<Inscricao>(`/inscricoes/${id}/rejeitar`, {
      method: 'POST', body: JSON.stringify({ motivo }),
    }),
  converter: (id: string) =>
    fetchAPI<{ aluno_id: string; numero_aluno: string; matricula_id: string; numero_matricula: string }>(
      `/inscricoes/${id}/converter`, { method: 'POST' },
    ),
}

// ── Cursos & Classes ──────────────────────────────────────
export interface Curso { id: string; nome: string; descricao: string | null }
export interface Classe {
  id: string; nome: string; curso_id: string; ano_academico_id: string
  turno: string | null; sala: string | null; vagas: number | null
}
export const cursosAPI = {
  listar: () => fetchAPI<Curso[]>('/cursos'),
  criar: (data: { nome: string; codigo: string; descricao?: string; duracao_anos?: number; nivel?: string }) =>
    fetchAPI<Curso>('/cursos', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: string, data: { nome?: string; descricao?: string; duracao_anos?: number; nivel?: string }) =>
    fetchAPI<Curso>(`/cursos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivar: (id: string, motivo: string) =>
    fetchAPI<Curso>(`/cursos/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activar: (id: string, motivo: string) =>
    fetchAPI<Curso>(`/cursos/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
}
export const classesAPI = {
  listar: (anoId?: string, cursoId?: string) => {
    const qs = new URLSearchParams()
    if (anoId) qs.append('ano_academico_id', anoId)
    if (cursoId) qs.append('curso_id', cursoId)
    const s = qs.toString()
    return fetchAPI<Classe[]>(`/classes${s ? `?${s}` : ''}`)
  },
  criar: (data: unknown) =>
    fetchAPI<Classe>('/classes', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: string, data: { nome?: string; turno?: string; sala?: string; max_alunos?: number }) =>
    fetchAPI<Classe>(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivar: (id: string, motivo: string) =>
    fetchAPI<Classe>(`/classes/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  activar: (id: string, motivo: string) =>
    fetchAPI<Classe>(`/classes/${id}/activar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
}

// ── Modulos UI (admin) ────────────────────────────────────
export const modulosAdminAPI = {
  criarModulo: (data: { nome: string; icone?: string; ordem?: number }) =>
    fetchAPI('/ui/modulos', { method: 'POST', body: JSON.stringify(data) }),
  criarMenu: (data: { modulo_id: string; nome: string; icone?: string; ordem?: number }) =>
    fetchAPI('/ui/menus', { method: 'POST', body: JSON.stringify(data) }),
  criarPagina: (data: { menu_id: string; nome: string; rota: string; icone?: string; permissao_codigo?: string; ordem?: number }) =>
    fetchAPI('/ui/paginas', { method: 'POST', body: JSON.stringify(data) }),
}

export const auditoriaAPI = {
  log: (filtros: { tabela?: string; user_id?: string; accao?: string; limite?: number } = {}) => {
    const qs = new URLSearchParams()
    Object.entries(filtros).forEach(([k, v]) => v != null && qs.append(k, String(v)))
    const s = qs.toString()
    return fetchAPI<AuditLog[]>(`/auditoria/log${s ? `?${s}` : ''}`)
  },
}

// ── Portal Aluno ──────────────────────────────────────────
export const portalAlunoAPI = {
  perfil: () => fetchAPI<{
    id: string; numero_aluno: string; nome_completo: string; data_nascimento: string
    email: string | null; telefone: string | null; bi_numero: string | null
    enc_nome: string | null; enc_telefone: string | null
    curso: string | null; classe: string | null; ano_academico: string | null
  }>('/aluno/perfil'),
  historicoEscolar: () => fetchAPI<Array<{
    ano_academico: string; classe: string | null; estado_final: string | null; media_final: string | null
  }>>('/aluno/historico-escolar'),
  frequencias: () => fetchAPI<Array<{
    disciplina: string; trimestre: string; total_aulas: number; faltas: number
    justificadas: number; percentagem_presenca: number
  }>>('/aluno/frequencias'),
  horario: () => fetchAPI<Array<{
    dia_semana: number; hora_inicio: string; hora_fim: string
    disciplina: string; sala: string | null; docente: string | null
  }>>('/aluno/horario'),
  calendario: () => fetchAPI<Array<{
    id: string; tipo: string; titulo: string; data_inicio: string; data_fim: string | null; descricao: string | null
  }>>('/aluno/calendario'),
  downloads: () => fetchAPI<Array<{
    id: string; tipo: string; descricao: string | null; ficheiro_url: string | null; created_at: string
  }>>('/aluno/downloads'),
  registarDownload: (tipo: string, descricao?: string, ficheiro_url?: string) =>
    fetchAPI('/aluno/downloads', { method: 'POST', body: JSON.stringify({ tipo, descricao, ficheiro_url }) }),
  minhasPropinas: () => fetchAPI<Array<{
    id: string; mes: number; ano: number; valor: number; valor_pago: number
    data_vencimento: string; data_pagamento: string | null; estado: string
    referencia_pagamento: string | null
  }>>('/aluno/minhas-propinas'),
}

// ── Solicitações ──────────────────────────────────────────
export interface Solicitacao {
  id: string; numero_solicitacao: string; tipo: string; estado: string
  observacoes: string | null; resposta: string | null; ficheiro_url: string | null; created_at: string
}
export const solicitacoesAPI = {
  listar: (estado?: string) => fetchAPI<Solicitacao[]>(`/solicitacoes${estado ? `?estado=${estado}` : ''}`),
  criar: (tipo: string, observacoes?: string, ano_academico_id?: string) =>
    fetchAPI<Solicitacao>('/solicitacoes', { method: 'POST', body: JSON.stringify({ tipo, observacoes, ano_academico_id }) }),
  obter: (id: string) => fetchAPI<Solicitacao>(`/solicitacoes/${id}`),
  actualizarEstado: (id: string, estado: string, resposta?: string, ficheiro_url?: string) =>
    fetchAPI<Solicitacao>(`/solicitacoes/${id}/estado`, {
      method: 'PATCH', body: JSON.stringify({ estado, resposta, ficheiro_url }),
    }),
  historico: (id: string) => fetchAPI<Array<{
    id: string; estado_anterior: string | null; estado_novo: string; observacao: string | null; created_at: string
  }>>(`/solicitacoes/${id}/historico`),
}

// ── Portal Encarregado ────────────────────────────────────
export const encarregadoAPI = {
  alunos: () => fetchAPI<Array<{ id: string; aluno_id: string; nome_aluno: string; numero_aluno: string; grau_parentesco: string | null }>>('/encarregado/alunos'),
  associar: (aluno_id: string, grau_parentesco?: string) =>
    fetchAPI('/encarregado/alunos', { method: 'POST', body: JSON.stringify({ aluno_id, grau_parentesco }) }),
  notas: (alunoId: string) => fetchAPI<Array<{ id: string; tipo: string; nota: string; nota_maxima: string }>>(`/encarregado/notas/${alunoId}`),
  frequencia: (alunoId: string) => fetchAPI<Array<{ disciplina: string; trimestre: string; total_aulas: number; faltas: number }>>(`/encarregado/frequencia/${alunoId}`),
  financeiro: (alunoId: string) => fetchAPI<Array<{ id: string; mes: number; ano: number; valor: string; estado: string }>>(`/encarregado/financeiro/${alunoId}`),
}

// ── Portal Docente ────────────────────────────────────────
export const docenteAPI = {
  minhasTurmas: (anoId?: string) =>
    fetchAPI<Array<{ classe_id: string; disciplinas: Array<{ id: string; nome: string }> }>>(
      `/docente/minhas-turmas${anoId ? `?ano_academico_id=${anoId}` : ''}`
    ),
  diario: (disciplinaId: string, turmaId: string) =>
    fetchAPI<Array<{ id: string; titulo: string; data_aula: string }>>(`/docente/diario/${disciplinaId}/${turmaId}`),
  registarSumario: (disciplina_id: string, titulo: string, data_aula: string, unidade_id?: string) =>
    fetchAPI('/docente/diario/sumario', { method: 'POST', body: JSON.stringify({ disciplina_id, titulo, data_aula, unidade_id }) }),
  lancarFrequencia: (disciplina_id: string, trimestre_id: string, registos: Array<{ aluno_id: string; total_aulas: number; faltas: number }>) =>
    fetchAPI('/docente/frequencia/lancar', { method: 'POST', body: JSON.stringify({ disciplina_id, trimestre_id, registos }) }),
  lancarNotasLote: (disciplina_id: string, trimestre_id: string, tipo: string, notas: Array<{ aluno_id: string; nota: number }>) =>
    fetchAPI('/docente/notas/lancar-lote', { method: 'POST', body: JSON.stringify({ disciplina_id, trimestre_id, tipo, notas }) }),
  planoAula: (disciplinaId: string, anoId: string) =>
    fetchAPI<Array<{ id: string; titulo: string; ordem: number; sumarios: Array<{ titulo: string; data_aula: string }> }>>(
      `/docente/plano-aula/${disciplinaId}?ano_academico_id=${anoId}`
    ),
  alunosDaClasse: (classeId: string, anoId: string) =>
    fetchAPI<Array<{ aluno_id: string; numero_aluno: string; nome_completo: string }>>(
      `/docente/alunos-da-classe/${classeId}?ano_academico_id=${anoId}`
    ),
}

// ── Dashboard BI ──────────────────────────────────────────
export const dashboardBIAPI = {
  executivo: () => fetchAPI<{
    total_alunos: number; matriculas_activas: number; propinas_pendentes: number
    receita_total: string; receita_pendente: string; funcionarios_activos: number
  }>('/dashboard/executivo'),
  pedagogico: () => fetchAPI<{
    total_avaliados: number; aprovados: number; reprovados: number
    taxa_aprovacao: number; taxa_reprovacao: number; media_geral: string | null
  }>('/dashboard/pedagogico'),
  financeiro: () => fetchAPI<{
    total_esperado: string; total_recebido: string; total_pendente: string
    total_vencido: string; taxa_cobranca: number
  }>('/dashboard/financeiro'),
  rh: () => fetchAPI<{ funcionarios_activos: number; custo_salarial_base: string; contratos_a_expirar: number }>('/dashboard/rh'),
}

// ── Workflows ─────────────────────────────────────────────
export const workflowsAPI = {
  listar: () => fetchAPI<Array<{ id: string; nome: string; tipo: string }>>('/workflows'),
  criar: (nome: string, tipo: string, descricao?: string) =>
    fetchAPI('/workflows', { method: 'POST', body: JSON.stringify({ nome, tipo, descricao }) }),
  instancias: (workflow_id?: string, estado?: string) => {
    const qs = new URLSearchParams()
    if (workflow_id) qs.append('workflow_id', workflow_id)
    if (estado) qs.append('estado', estado)
    const s = qs.toString()
    return fetchAPI<Array<{ id: string; estado: string; step_actual: number; created_at: string }>>(`/workflows/instancias${s ? `?${s}` : ''}`)
  },
  iniciarInstancia: (workflow_id: string, referencia_id?: string, referencia_tipo?: string, observacoes?: string) =>
    fetchAPI('/workflows/instancias', { method: 'POST', body: JSON.stringify({ workflow_id, referencia_id, referencia_tipo, observacoes }) }),
  avancar: (instanciaId: string, estado: string, observacao?: string) =>
    fetchAPI(`/workflows/instancias/${instanciaId}/avancar`, {
      method: 'PATCH', body: JSON.stringify({ estado, observacao }),
    }),
}

// ── Pagamentos Online ─────────────────────────────────────
export const pagamentosAPI = {
  gateways: () => fetchAPI<Array<{ id: string; nome: string; tipo: string }>>('/pagamentos/gateways'),
  iniciar: (propina_id: string, gateway_tipo: string, telefone?: string) =>
    fetchAPI<{ transacao_id: string; referencia: string; valor: string; instrucoes: Record<string, unknown> }>(
      '/pagamentos/iniciar', { method: 'POST', body: JSON.stringify({ propina_id, gateway_tipo, telefone }) }
    ),
  consultar: (transacaoId: string) =>
    fetchAPI<{ id: string; referencia_externa: string; valor: string; estado: string }>(`/pagamentos/transacoes/${transacaoId}`),
}

// ── LMS ───────────────────────────────────────────────────
export const lmsAPI = {
  cursos: (publicado?: boolean) => fetchAPI<Array<{ id: string; titulo: string; is_publicado: boolean }>>(
    `/lms/cursos${publicado !== undefined ? `?publicado=${publicado}` : ''}`
  ),
  criarCurso: (titulo: string, descricao?: string, disciplina_id?: string) =>
    fetchAPI<{ id: string; titulo: string }>('/lms/cursos', { method: 'POST', body: JSON.stringify({ titulo, descricao, disciplina_id }) }),
  publicarCurso: (id: string) => fetchAPI(`/lms/cursos/${id}/publicar`, { method: 'POST' }),
  modulos: (cursoId: string) => fetchAPI<Array<{ id: string; titulo: string; ordem: number }>>(`/lms/cursos/${cursoId}/modulos`),
  aulas: (moduloId: string) => fetchAPI<Array<{ id: string; titulo: string; tipo: string }>>(`/lms/modulos/${moduloId}/aulas`),
  questionario: (qId: string) => fetchAPI<{ id: string; titulo: string; perguntas: unknown[] }>(`/lms/questionarios/${qId}`),
  responder: (qId: string, respostas: Array<{ pergunta_id: string; resposta_id?: string; resposta_texto?: string }>) =>
    fetchAPI<{ tentativa: number; nota_20: number; aprovado: boolean }>(
      `/lms/questionarios/${qId}/responder`, { method: 'POST', body: JSON.stringify({ respostas }) }
    ),
}

// ── SaaS ──────────────────────────────────────────────────
export const saasAPI = {
  dashboard: () => fetchAPI<{ total_schools: number; schools_activas: number; assinaturas_activas: number; receita_total: string }>('/saas/dashboard'),
  schools: () => fetchAPI<Array<{ id: string; nome: string; codigo: string; is_activa: string }>>('/saas/schools'),
  criarSchool: (nome: string, codigo: string, email_contacto?: string) =>
    fetchAPI<{ id: string; tenant_id: string }>('/saas/schools', { method: 'POST', body: JSON.stringify({ nome, codigo, email_contacto }) }),
  plans: () => fetchAPI<Array<{ id: string; nome: string; tipo: string; preco_mensal: string }>>('/saas/plans'),
  assinar: (school_id: string, plan_id: string, data_inicio: string) =>
    fetchAPI('/saas/subscriptions', { method: 'POST', body: JSON.stringify({ school_id, plan_id, data_inicio }) }),
}

// ── Eventos (Palestras, Workshops, Olimpiadas, Reunioes) ──
export interface Evento {
  id: string
  titulo: string
  data_evento: string
  descricao: string | null
  local: string | null
  palestrante: string | null
  vagas: number
}

function _eventoAPI(prefix: string) {
  return {
    listar: () => fetchAPI<Evento[]>(`/${prefix}`),
    criar: (data: { titulo: string; data_evento: string; descricao?: string; local?: string; palestrante?: string; vagas?: number }) =>
      fetchAPI<Evento>(`/${prefix}`, { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id: string, data: { titulo?: string; data_evento?: string; descricao?: string; local?: string; palestrante?: string; vagas?: number }) =>
      fetchAPI<Evento>(`/${prefix}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    inactivar: (id: string, motivo: string) =>
      fetchAPI<Evento>(`/${prefix}/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
    inscrever: (id: string, data: { participante_nome: string; participante_email?: string; aluno_id?: string }) =>
      fetchAPI(`/${prefix}/${id}/inscricoes`, { method: 'POST', body: JSON.stringify(data) }),
    inscricoes: (id: string) =>
      fetchAPI<Array<{ id: string; participante_nome: string; participante_email: string | null }>>(`/${prefix}/${id}/inscricoes`),
    cancelarInscricao: (inscricaoId: string, motivo: string) =>
      fetchAPI(`/${prefix}/inscricoes/${inscricaoId}/cancelar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  }
}

export const palestrasAPI = _eventoAPI('palestras')
export const workshopsAPI = _eventoAPI('workshops')
export const olimpiadasAPI = _eventoAPI('olimpiadas')
export const reunioesAPI = _eventoAPI('reunioes')

// ── Ocorrencias / Disciplinar ─────────────────────────────
export interface Ocorrencia {
  id: string
  titulo: string
  descricao: string | null
  tipo: string | null
  gravidade: string | null
  data_ocorrencia: string
  aluno_id: string | null
  resolucao: string | null
  data_resolucao: string | null
}
export const ocorrenciasAPI = {
  listar: (alunoId?: string) =>
    fetchAPI<Ocorrencia[]>(`/ocorrencias${alunoId ? `?aluno_id=${alunoId}` : ''}`),
  criar: (data: { titulo: string; descricao?: string; tipo?: string; gravidade?: string; data_ocorrencia: string; aluno_id?: string; resolucao?: string; data_resolucao?: string }) =>
    fetchAPI<Ocorrencia>('/ocorrencias', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: string, data: { titulo?: string; descricao?: string; tipo?: string; gravidade?: string; resolucao?: string; data_resolucao?: string }) =>
    fetchAPI<Ocorrencia>(`/ocorrencias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  inactivar: (id: string, motivo: string) =>
    fetchAPI<Ocorrencia>(`/ocorrencias/${id}/inactivar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
}

// ── Pedidos de Reabertura ─────────────────────────────────
export interface PedidoReabertura {
  id: string
  tipo: 'trimestre' | 'ano_academico' | 'pauta'
  referencia_id: string
  motivo: string
  estado: 'pendente' | 'aprovado' | 'rejeitado'
  solicitado_por_id: string
  decidido_por_id: string | null
  decisao_motivo: string | null
  created_at: string
}
export const pedidosReaberturaAPI = {
  criar: (data: { tipo: string; referencia_id: string; motivo: string }) =>
    fetchAPI<PedidoReabertura>('/pedidos-reabertura', { method: 'POST', body: JSON.stringify(data) }),
  listar: (estado?: string, tipo?: string) => {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (tipo) params.set('tipo', tipo)
    const qs = params.toString()
    return fetchAPI<PedidoReabertura[]>(`/pedidos-reabertura${qs ? `?${qs}` : ''}`)
  },
  meus: () => fetchAPI<PedidoReabertura[]>('/pedidos-reabertura/meus'),
  aprovar: (id: string, motivo?: string) =>
    fetchAPI<PedidoReabertura>(`/pedidos-reabertura/${id}/aprovar`, { method: 'POST', body: JSON.stringify({ motivo: motivo ?? '' }) }),
  rejeitar: (id: string, motivo: string) =>
    fetchAPI<PedidoReabertura>(`/pedidos-reabertura/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
}

export interface LerBiResponse {
  nome: string
  bi_numero: string
  data_nascimento: string
  nif: string
  sexo: string
  fonte: string
}

export const documentosAPI = {
  gerarDeclaracao: (data: {
    aluno_id: string
    tipo: string
    ano_academico_id: string
    finalidade?: string
    observacoes?: string
  }) =>
    fetch(`${API_BASE}/documentos/declaracao/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(readToken() ? { Authorization: `Bearer ${readToken()}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
  gerarCaderneta: (aluno_id: string, ano_academico_id: string) =>
    fetch(
      `${API_BASE}/documentos/caderneta/${aluno_id}/pdf?ano_academico_id=${ano_academico_id}`,
      {
        headers: readToken() ? { Authorization: `Bearer ${readToken()}` } : {},
        credentials: 'include',
      },
    ),
  gerarCartao: (data: { aluno_id: string; ano_academico_id: string; foto_base64?: string }) =>
    fetch(`${API_BASE}/documentos/cartao-aluno/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(readToken() ? { Authorization: `Bearer ${readToken()}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
  lerBi: (data: {
    mrz_linha1?: string
    mrz_linha2?: string
    nome?: string
    bi_numero?: string
    data_nascimento?: string
    nif?: string
    sexo?: string
  }) =>
    fetchAPI<LerBiResponse>('/documentos/ler-bi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
