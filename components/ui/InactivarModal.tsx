'use client'

import { useState } from 'react'

interface Props {
  titulo: string
  descricao?: string
  onConfirm: (motivo: string) => Promise<void>
  onCancel: () => void
}

export function InactivarModal({ titulo, descricao, onConfirm, onCancel }: Props) {
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirm() {
    if (motivo.trim().length < 3) {
      setErro('Motivo obrigatório (mínimo 3 caracteres)')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo.trim())
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao inactivar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{titulo}</h2>
        {descricao && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{descricao}</p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="Indique o motivo da inactivação..."
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
          {erro && <p className="text-red-500 text-xs mt-1">{erro}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || motivo.trim().length < 3}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'A inactivar...' : 'Inactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ReactivarProps {
  titulo: string
  onConfirm: (motivo: string) => Promise<void>
  onCancel: () => void
}

export function ReactivarModal({ titulo, onConfirm, onCancel }: ReactivarProps) {
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirm() {
    if (motivo.trim().length < 3) {
      setErro('Motivo obrigatório (mínimo 3 caracteres)')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo.trim())
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao activar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{titulo}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Indique o motivo da reactivação..."
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
          {erro && <p className="text-red-500 text-xs mt-1">{erro}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || motivo.trim().length < 3}
            className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'A activar...' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}
