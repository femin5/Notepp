import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Note = {
  id: number | string
  title: string
  content: string
  color: string
  tags: string[]
  archived: boolean
  pinned?: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'stock'> &
  Partial<Pick<Note, 'createdAt' | 'updatedAt' | 'stock'>>

type NotesContextValue = {
  notes: Note[]
  loading: boolean
  error: string | null
  toasts: { id: number; message: string }[]
  createNote: (note: NewNote) => Promise<Note>
  updateNote: (id: Note['id'], updates: Partial<Note>) => Promise<Note>
  deleteNote: (id: Note['id']) => Promise<void>
  toggleArchive: (id: Note['id']) => Promise<Note>
  searchNotes: (query: string) => Note[]
  fetchNotes: () => Promise<void>
  dismissToast: (id: number) => void
}

const NOTES_URL = 'http://localhost:5000/notes'
const NotesContext = createContext<NotesContextValue | undefined>(undefined)

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred'
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [pendingRequests, setPendingRequests] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<NotesContextValue['toasts']>([])

  const runRequest = useCallback(async <T,>(request: () => Promise<T>) => {
    setPendingRequests((count) => count + 1)
    setError(null)

    try {
      return await request()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      throw requestError
    } finally {
      setPendingRequests((count) => Math.max(0, count - 1))
    }
  }, [])

  const addToast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const fetchNotes = useCallback(async () => {
    await runRequest(async () => {
      const response = await axios.get<Note[]>(NOTES_URL)
      setNotes(response.data)
    })
  }, [runRequest])

  useEffect(() => {
    void fetchNotes().catch(() => {
      // The context error state exposes the request failure to the UI.
    })
  }, [fetchNotes])

  const createNote = useCallback(async (note: NewNote) => {
    const currentTime = new Date().toISOString()
    const payload = {
      ...note,
      pinned: note.pinned ?? false,
      archived: note.archived ?? false,
      stock: note.stock ?? 0,
      createdAt: note.createdAt ?? currentTime,
      updatedAt: currentTime
    }
    const created = await runRequest(async () => {
      const response = await axios.post<Note>(NOTES_URL, payload)
      setNotes((current) => [response.data, ...current])
      return response.data
    })
    addToast('Note created')
    return created
  }, [addToast, runRequest])

  const updateNote = useCallback(async (id: Note['id'], updates: Partial<Note>) => {
    const existing = notes.find((note) => note.id === id)
    if (!existing) {
      throw new Error('The note could not be found')
    }

    const updated = await runRequest(async () => {
      const response = await axios.put<Note>(`${NOTES_URL}/${id}`, {
        ...existing,
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      })
      setNotes((current) =>
        current.map((note) => note.id === id ? response.data : note)
      )
      return response.data
    })
    addToast('Note updated')
    return updated
  }, [addToast, notes, runRequest])

  const deleteNote = useCallback(async (id: Note['id']) => {
    await runRequest(async () => {
      await axios.delete(`${NOTES_URL}/${id}`)
      setNotes((current) => current.filter((note) => note.id !== id))
    })
    addToast('Note deleted')
  }, [addToast, runRequest])

  const toggleArchive = useCallback(async (id: Note['id']) => {
    const existing = notes.find((note) => note.id === id)
    if (!existing) {
      throw new Error('The note could not be found')
    }

    const updated = await runRequest(async () => {
      const response = await axios.patch<Note>(`${NOTES_URL}/${id}`, {
        archived: !existing.archived,
        updatedAt: new Date().toISOString()
      })
      setNotes((current) =>
        current.map((note) => note.id === id ? response.data : note)
      )
      return response.data
    })
    addToast(updated.archived ? 'Note archived' : 'Note unarchived')
    return updated
  }, [addToast, notes, runRequest])

  const searchNotes = useCallback((query: string) => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return notes
    }

    return notes.filter((note) =>
      (note.title || '').toLowerCase().includes(normalizedQuery) ||
      (note.content || '').toLowerCase().includes(normalizedQuery) ||
      (note.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))
    )
  }, [notes])

  const value = useMemo(() => ({
    notes,
    loading: pendingRequests > 0,
    error,
    toasts,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
    searchNotes,
    fetchNotes,
    dismissToast
  }), [
    notes,
    pendingRequests,
    error,
    toasts,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
    searchNotes,
    fetchNotes,
    dismissToast
  ])

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }

  return context
}
