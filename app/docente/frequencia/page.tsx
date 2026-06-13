'use client';

import { useEffect, useState } from 'react';
import { docenteAPI } from '@/lib/api';

interface Aluno {
  id: string;
  nome_completo: string;
  numero_aluno: string;
}

interface TurmaAPI {
  classe_id: string;
  disciplinas: Array<{ id: string; nome: string }>;
}

interface Turma {
  disciplina_id: string;
  turma_id: string;
  disciplina: string;
  turma: string;
  classe: string;
}

interface FreqEntry {
  aluno_id: string;
  presente: boolean;
  justificada: boolean;
  observacao?: string;
}

export default function DocenteFrequenciaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaSelId, setTurmaSelId] = useState('');
  const [disciplinaSelId, setDisciplinaSelId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [frequencias, setFrequencias] = useState<Record<string, FreqEntry>>({});
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    docenteAPI.minhasTurmas().then((data: TurmaAPI[]) => {
      const flat: Turma[] = data.flatMap(t =>
        t.disciplinas.map(d => ({
          disciplina_id: d.id,
          turma_id: t.classe_id,
          disciplina: d.nome,
          turma: t.classe_id,
          classe: t.classe_id,
        }))
      );
      setTurmas(flat);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!turmaSelId) return;
    setLoading(true);
    docenteAPI.alunosDaClasse(turmaSelId, '')
      .then((data: Aluno[]) => {
        setAlunos(data);
        const init: Record<string, FreqEntry> = {};
        data.forEach((a: Aluno) => {
          init[a.id] = { aluno_id: a.id, presente: true, justificada: false };
        });
        setFrequencias(init);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [turmaSelId]);

  const toggle = (alunoId: string, field: 'presente' | 'justificada') => {
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], [field]: !prev[alunoId][field] },
    }));
  };

  const handleGuardar = async () => {
    if (!disciplinaSelId || !turmaSelId) {
      setMsg('Seleccione turma e disciplina');
      return;
    }
    setGuardando(true);
    try {
      await docenteAPI.lancarFrequencia(
        disciplinaSelId,
        turmaSelId,
        Object.values(frequencias).map(f => ({
          aluno_id: f.aluno_id,
          total_aulas: 1,
          faltas: f.presente ? 0 : 1,
        }))
      );
      setMsg('Frequência guardada com sucesso!');
    } catch (e: unknown) {
      setMsg(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGuardando(false);
    }
  };

  const turma = turmas.find(t => t.turma_id === turmaSelId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lançamento de Frequência</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turma / Disciplina</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={`${turmaSelId}||${disciplinaSelId}`}
            onChange={e => {
              const [turId, disId] = e.target.value.split('||');
              setTurmaSelId(turId);
              setDisciplinaSelId(disId);
            }}
          >
            <option value="||">— Seleccionar —</option>
            {turmas.map(t => (
              <option key={`${t.turma_id}-${t.disciplina_id}`} value={`${t.turma_id}||${t.disciplina_id}`}>
                {t.disciplina} — {t.classe} {t.turma}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data da Aula</label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={data}
            onChange={e => setData(e.target.value)}
          />
        </div>
        {turma && (
          <div className="flex items-end gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {turma.disciplina}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {alunos.length} alunos
            </span>
          </div>
        )}
      </div>

      {/* Acções rápidas */}
      {alunos.length > 0 && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setFrequencias(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(id => { updated[id] = { ...updated[id], presente: true }; });
              return updated;
            })}
            className="text-sm px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100"
          >
            Todos presentes
          </button>
          <button
            onClick={() => setFrequencias(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(id => { updated[id] = { ...updated[id], presente: false }; });
              return updated;
            })}
            className="text-sm px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100"
          >
            Todos ausentes
          </button>
        </div>
      )}

      {/* Lista de alunos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : alunos.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Presente</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Justificada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.map(aluno => {
                const f = frequencias[aluno.id];
                return (
                  <tr key={aluno.id} className={`transition-colors ${!f?.presente ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{aluno.nome_completo}</div>
                      <div className="text-xs text-gray-400">{aluno.numero_aluno}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(aluno.id, 'presente')}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${
                          f?.presente
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-red-400'
                        }`}
                      >
                        {f?.presente ? '✓' : '✗'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={f?.justificada ?? false}
                        onChange={() => toggle(aluno.id, 'justificada')}
                        disabled={f?.presente}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : turmaSelId ? (
        <div className="text-center py-8 text-gray-500">Sem alunos nesta turma.</div>
      ) : null}

      {/* Sumário e guardar */}
      {alunos.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Presentes: <span className="font-bold text-green-600">{Object.values(frequencias).filter(f => f.presente).length}</span>{' '}
            | Ausentes: <span className="font-bold text-red-600">{Object.values(frequencias).filter(f => !f.presente).length}</span>
          </div>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? 'A guardar...' : 'Guardar Frequência'}
          </button>
        </div>
      )}

      {msg && (
        <div className={`mt-4 p-3 rounded-md text-sm ${msg.startsWith('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </div>
      )}
    </div>
  );
}
