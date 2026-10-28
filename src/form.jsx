
import { useState, useEffect } from 'react'
import PickingColor from './color'

function Form({ saveNote, noteToEdit, cancelForm }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteColor, setNoteColor] = useState('yellow')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '')
      setContent(noteToEdit.content || '')
      setNoteColor(noteToEdit.color || 'yellow')
      setTags((noteToEdit.tags || []).join(', '))
    } else {
      setTitle('')
      setContent('')
      setNoteColor('yellow')
      setTags('')
    }

    setError('')
  }, [noteToEdit])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (content.trim() === '') {
      setError('Please enter note content')
      return
    }

    if (title.length > 100) {
      setError('Title cannot exceed 100 characters')
      return
    }

    if (content.length > 5000) {
      setError('Content cannot exceed 5000 characters')
      return
    }

    if (tags.length > 200) {
      setError('Tags cannot exceed 200 characters')
      return
    }

    const note = {
      title: title.trim(),
      content: content.trim(),
      color: noteColor,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    }

    if (noteToEdit) {
      note.id = noteToEdit.id
      note.createdAt = noteToEdit.createdAt
      note.pinned = noteToEdit.pinned
      note.archived = noteToEdit.archived
    }

    const saved = saveNote(note)

    if (saved) {
      setTitle('')
      setContent('')
      setNoteColor('yellow')
      setTags('')
      setError('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl bg-gray-800 p-6"
    >
      <h2 className="mb-4 text-2xl font-semibold">
        {noteToEdit ? 'Edit Note' : 'Create a New Note'}
      </h2>

      {error && (
        <p className="mb-4 rounded-lg bg-red-900 p-3 text-red-200">
          {error}
        </p>
      )}

      <label className="mb-2 block">
        Title (optional)
      </label>

      <input
        type="text"
        value={title}
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title"
        className="mb-2 w-full rounded-lg bg-gray-700 p-3 text-white"
      />

      <p className="mb-4 text-sm text-gray-400">
        {title.length}/100 characters
      </p>

      <label className="mb-2 block">
        Content (required)
      </label>

      <textarea
        value={content}
        maxLength={5000}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={5}
        className="mb-2 w-full rounded-lg bg-gray-700 p-3 text-white"
      />

      <p className="mb-4 text-sm text-gray-400">
        {content.length}/5000 characters
      </p>

      <label className="mb-2 block">
        Tags
      </label>

      <input
        type="text"
        value={tags}
        maxLength={200}
        onChange={(e) => setTags(e.target.value)}
        placeholder="college, work, ideas"
        className="mb-5 w-full rounded-lg bg-gray-700 p-3 text-white"
      />

      <PickingColor
        noteColor={noteColor}
        setNoteColor={setNoteColor}
      />

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-5 py-3 hover:bg-green-700"
        >
          {noteToEdit ? 'Update Note' : 'Save Note'}
        </button>

        <button
          type="button"
          onClick={cancelForm}
          className="rounded-lg bg-gray-600 px-5 py-3 hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default Form
