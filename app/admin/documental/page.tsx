'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

interface Folder {
  id: string;
  nome: string;
  tipo: string;
  parent_id?: string;
  owner_id?: string;
}

interface DocVersion {
  id: string;
  nome_ficheiro: string;
  versao: number;
  caminho_minio: string;
  hash_sha256: string;
  is_latest: string;
  created_at: string;
  assinaturas?: Signature[];
}

interface Signature {
  id: string;
  assinado_por: string;
  algoritmo: string;
  created_at: string;
}

export default function DocumentalPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [docs, setDocs] = useState<DocVersion[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [novaFolder, setNovaFolder] = useState({ nome: '', tipo: 'GERAL' });
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [msg, setMsg] = useState('');

  const carregarFolders = async () => {
    setLoadingFolders(true);
    try {
      const data = await fetchAPI<Folder[]>('/documental/folders');
      setFolders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFolders(false);
    }
  };

  const carregarDocs = async (folderId: string) => {
    setLoadingDocs(true);
    try {
      const data = await fetchAPI<DocVersion[]>(`/documental/documentos/${folderId}`);
      const docsWithSigs = await Promise.all(
        data.map(async doc => {
          try {
            const sigs = await fetchAPI<Signature[]>(`/documental/documentos/${doc.id}/assinaturas`);
            return { ...doc, assinaturas: sigs };
          } catch {
            return { ...doc, assinaturas: [] };
          }
        })
      );
      setDocs(docsWithSigs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => { carregarFolders(); }, []);

  const handleSelectFolder = (f: Folder) => {
    setSelectedFolder(f);
    carregarDocs(f.id);
  };

  const handleCriarFolder = async () => {
    if (!novaFolder.nome.trim()) return;
    try {
      await fetchAPI('/documental/folders', {
        method: 'POST',
        body: JSON.stringify(novaFolder),
      });
      setNovaFolder({ nome: '', tipo: 'GERAL' });
      setShowAddFolder(false);
      setMsg('Pasta criada!');
      carregarFolders();
    } catch (e: unknown) {
      setMsg(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const TIPOS_FOLDER = ['GERAL', 'ACADEMICO', 'FINANCEIRO', 'RH', 'JURIDICO', 'SECRETARIA'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão Documental</h1>
        <button
          onClick={() => setShowAddFolder(!showAddFolder)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nova Pasta
        </button>
      </div>

      {showAddFolder && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Criar Nova Pasta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nome da pasta"
              value={novaFolder.nome}
              onChange={e => setNovaFolder(p => ({ ...p, nome: e.target.value }))}
              className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={novaFolder.tipo}
              onChange={e => setNovaFolder(p => ({ ...p, tipo: e.target.value }))}
              className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {TIPOS_FOLDER.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCriarFolder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                onClick={() => setShowAddFolder(false)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className={`mb-4 p-3 rounded-md text-sm ${msg.startsWith('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pastas */}
        <div className="md:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pastas</h2>
          {loadingFolders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFolder(f)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedFolder?.id === f.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">📁</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{f.nome}</div>
                    <div className="text-xs text-gray-400">{f.tipo}</div>
                  </div>
                </button>
              ))}
              {folders.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sem pastas. Crie a primeira.</p>
              )}
            </div>
          )}
        </div>

        {/* Documentos */}
        <div className="md:col-span-2">
          {selectedFolder ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Documentos — {selectedFolder.nome}
                </h2>
              </div>
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : docs.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center text-gray-400">
                  <div className="text-4xl mb-3">📄</div>
                  <p>Sem documentos nesta pasta.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {docs.map(doc => (
                    <div key={doc.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{doc.nome_ficheiro}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">v{doc.versao}</span>
                              {doc.is_latest === 'S' && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Actual</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('pt-AO')}</div>
                          {doc.assinaturas && doc.assinaturas.length > 0 && (
                            <div className="text-xs text-purple-600 mt-1">✍ {doc.assinaturas.length} assinatura(s)</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 font-mono truncate">SHA256: {doc.hash_sha256?.slice(0, 32)}…</div>
                      {doc.assinaturas && doc.assinaturas.length > 0 && (
                        <div className="mt-3 border-t pt-2 space-y-1">
                          {doc.assinaturas.map(sig => (
                            <div key={sig.id} className="flex items-center gap-2 text-xs text-gray-500">
                              <span>✍</span>
                              <span>{sig.assinado_por}</span>
                              <span className="text-gray-300">·</span>
                              <span>{sig.algoritmo}</span>
                              <span className="text-gray-300">·</span>
                              <span>{new Date(sig.created_at).toLocaleDateString('pt-AO')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">📂</div>
              <p className="text-lg">Seleccione uma pasta para ver os documentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
