
import { useState } from 'react'
import Form from './form'
import Card from './card'
import SearchNote from './searchNote'
import { useNotes } from './NotesContext'

function App() {
  const {
    notes,
    loading,
    error,
    toasts,
    createNote,
    updateNote,
    deleteNote: removeNote,
    toggleArchive,
    searchNotes,
    fetchNotes,
    dismissToast
  } = useNotes()
  const [showForm, setShowForm] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState(null)

  const [search, setSearch] = useState('')
  const [filterColor, setFilterColor] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState([])

  async function saveNote(note) {
    const title = note.title.trim()
    const content = note.content.trim()

    if (content === '') {
      alert('Note content cannot be empty')
      return false
    }

    if (title.length > 100) {
      alert('Title cannot exceed 100 characters')
      return false
    }

    const duplicate = notes.some((oldNote) => {
      return (
        oldNote.id !== note.id &&
        oldNote.title.trim().toLowerCase() === title.toLowerCase() &&
        oldNote.content.trim().toLowerCase() === content.toLowerCase()
      )
    })

    if (duplicate) {
      alert('This note already exists')
      return false
    }

    try {
      if (note.id) {
        await updateNote(note.id, { ...note, title, content })
      } else {
        await createNote({
          ...note,
          title,
          content,
          pinned: false,
          archived: false,
          stock: 0
        })
      }
    } catch {
      return false
    }

    setShowForm(false)
    setNoteToEdit(null)

    return true
  }

  function editNote(note) {
    setNoteToEdit(note)
    setShowForm(true)
  }

  async function deleteNote(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmed) {
      return
    }

    try {
      await removeNote(id)
      setSelectedNotes((oldSelected) =>
        oldSelected.filter((selectedId) => selectedId !== id)
      )
    } catch {
      // The context exposes the request failure in its error state.
    }
  }

  function archiveNote(id) {
    void toggleArchive(id).catch(() => {
      // The context exposes the request failure in its error state.
    })
  }

  function pinNote(id) {
    const note = notes.find((item) => item.id === id)
    if (!note) return

    void updateNote(id, { pinned: !note.pinned }).catch(() => {
      // The context exposes the request failure in its error state.
    })
  }

  function selectNote(id) {
    setSelectedNotes((oldSelected) =>
      oldSelected.includes(id)
        ? oldSelected.filter((selectedId) => selectedId !== id)
        : [...oldSelected, id]
    )
  }

  function deleteSelectedNotes() {
    if (selectedNotes.length === 0) {
      return
    }

    const confirmed = window.confirm(
      `Delete ${selectedNotes.length} selected note(s)?`
    )

    if (!confirmed) {
      return
    }

    Promise.all(selectedNotes.map((id) => removeNote(id)))
      .then(() => setSelectedNotes([]))
      .catch(() => {
        // The context exposes the request failure in its error state.
      })
  }

  function cancelForm() {
    setShowForm(false)
    setNoteToEdit(null)
  }

  const allTags = [
    ...new Set(notes.flatMap((note) => note.tags || []))
  ]

  let filteredNotes = searchNotes(search).filter((note) => {
    const matchesPage = showArchived
      ? note.archived
      : !note.archived

    const matchesColor =
      filterColor === 'all' || note.color === filterColor

    const matchesTag =
      filterTag === 'all' || (note.tags || []).includes(filterTag)

    return (
      matchesPage &&
      matchesColor &&
      matchesTag
    )
  })

  filteredNotes.sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }

    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }

    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt)
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    }

    if (sortBy === 'color') {
      return a.color.localeCompare(b.color)
    }

    return 0
  })

  return (
    <div className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              My Notes
            </h1>

            <p className="mt-2 text-gray-400">
              Keep your ideas organized
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setShowArchived(!showArchived)
                setSelectedNotes([])
              }}
              className="rounded-lg bg-gray-700 px-4 py-3 hover:bg-gray-600"
            >
              {showArchived ? 'View Notes' : 'View Archive'}
            </button>

            <button
              type="button"
              onClick={() => {
                setNoteToEdit(null)
                setShowForm(true)
              }}
              className="rounded-lg bg-blue-600 px-4 py-3 hover:bg-blue-700"
            >
              + New Note
            </button>
          </div>
        </header>

        {loading && (
          <div
            className="mb-4 flex items-center gap-3 text-blue-300"
            role="status"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
            Loading notes...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-900 p-3 text-red-200" role="alert">
            Could not sync notes: {error}
            <button
              type="button"
              onClick={() => {
                void fetchNotes().catch(() => {
                  // The context exposes the request failure in its error state.
                })
              }}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="fixed right-4 top-4 z-50 flex flex-col gap-2" aria-live="polite">
          {toasts.map((toast) => (
            <button
              key={toast.id}
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg bg-green-700 px-4 py-3 text-left text-white shadow-lg"
            >
              {toast.message}
            </button>
          ))}
        </div>

        {showForm && (
          <Form
            key={noteToEdit ? noteToEdit.id : 'new-note'}
            saveNote={saveNote}
            noteToEdit={noteToEdit}
            cancelForm={cancelForm}
          />
        )}

        <SearchNote
          search={search}
          setSearch={setSearch}
          filterColor={filterColor}
          setFilterColor={setFilterColor}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          sortBy={sortBy}
          setSortBy={setSortBy}
          allTags={allTags}
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {showArchived ? 'Archived Notes' : 'Your Notes'}
            <span className="ml-2 text-sm text-gray-400">
              ({filteredNotes.length})
            </span>
          </h2>

          {selectedNotes.length > 0 && (
            <button
              type="button"
              onClick={deleteSelectedNotes}
              className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
            >
              Delete Selected ({selectedNotes.length})
            </button>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center">
            <p className="text-lg text-gray-300">
              {showArchived
                ? 'No archived notes found.'
                : 'No notes found.'}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Create a note or change your search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                note={note}
                editNote={editNote}
                deleteNote={deleteNote}
                archiveNote={archiveNote}
                pinNote={pinNote}
                selectNote={selectNote}
                selectedNotes={selectedNotes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
