
import { useState, useEffect } from 'react'
import Form from './form'
import Card from './card'
import SearchNote from './searchNote'

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem('notes')
      return savedNotes ? JSON.parse(savedNotes) : []
    } catch {
      return []
    }
  })

  const [showForm, setShowForm] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState(null)

  const [search, setSearch] = useState('')
  const [filterColor, setFilterColor] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState([])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  function saveNote(note) {
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

    const currentTime = new Date().toISOString()

    if (note.id) {
      setNotes((oldNotes) =>
        oldNotes.map((oldNote) =>
          oldNote.id === note.id
            ? {
                ...oldNote,
                ...note,
                title,
                content,
                updatedAt: currentTime
              }
            : oldNote
        )
      )
    } else {
      const newNote = {
        ...note,
        id: Date.now(),
        title,
        content,
        pinned: false,
        archived: false,
        createdAt: currentTime,
        updatedAt: currentTime
      }

      setNotes((oldNotes) => [newNote, ...oldNotes])
    }

    setShowForm(false)
    setNoteToEdit(null)

    return true
  }

  function editNote(note) {
    setNoteToEdit(note)
    setShowForm(true)
  }

  function deleteNote(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmed) {
      return
    }

    setNotes((oldNotes) =>
      oldNotes.filter((note) => note.id !== id)
    )

    setSelectedNotes((oldSelected) =>
      oldSelected.filter((selectedId) => selectedId !== id)
    )
  }

  function archiveNote(id) {
    setNotes((oldNotes) =>
      oldNotes.map((note) =>
        note.id === id
          ? { ...note, archived: !note.archived }
          : note
      )
    )
  }

  function pinNote(id) {
    setNotes((oldNotes) =>
      oldNotes.map((note) =>
        note.id === id
          ? { ...note, pinned: !note.pinned }
          : note
      )
    )
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

    setNotes((oldNotes) =>
      oldNotes.filter(
        (note) => !selectedNotes.includes(note.id)
      )
    )

    setSelectedNotes([])
  }

  function cancelForm() {
    setShowForm(false)
    setNoteToEdit(null)
  }

  const allTags = [
    ...new Set(notes.flatMap((note) => note.tags || []))
  ]

  let filteredNotes = notes.filter((note) => {
    const matchesPage = showArchived
      ? note.archived
      : !note.archived

    const matchesSearch =
      (note.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(search.toLowerCase()) ||
      (note.tags || []).some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      )

    const matchesColor =
      filterColor === 'all' || note.color === filterColor

    const matchesTag =
      filterTag === 'all' || (note.tags || []).includes(filterTag)

    return (
      matchesPage &&
      matchesSearch &&
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
