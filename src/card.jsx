
function Card({
  note,
  editNote,
  deleteNote,
  archiveNote,
  pinNote,
  selectNote,
  selectedNotes
}) {
  const colors = {
    yellow: 'bg-yellow-200',
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    pink: 'bg-pink-200',
    purple: 'bg-purple-200',
    gray: 'bg-gray-200'
  }

  function showContent(text) {
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }

      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }

      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className={`rounded-xl p-5 text-gray-900 shadow-md ${colors[note.color] || colors.yellow}`}>
      <div className="mb-3 flex items-center justify-between">
        <input
          type="checkbox"
          checked={selectedNotes.includes(note.id)}
          onChange={() => selectNote(note.id)}
          aria-label="Select note"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => pinNote(note.id)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? '📌' : '📍'}
          </button>

          <button
            type="button"
            onClick={() => archiveNote(note.id)}
            title={note.archived ? 'Unarchive note' : 'Archive note'}
          >
            {note.archived ? '📤' : '📥'}
          </button>
        </div>
      </div>

      <h3 className="mb-2 break-words text-xl font-bold">
        {note.title || 'Untitled Note'}
      </h3>

      <div className="mb-4 break-words">
        {note.content.split('\n').map((line, index) => (
          <p key={index} className="min-h-5 whitespace-pre-wrap">
            {line.startsWith('- ')
              ? <>• {showContent(line.slice(2))}</>
              : showContent(line)}
          </p>
        ))}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-black/10 px-3 py-1 text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4 border-t border-black/10 pt-3 text-xs">
        <p>
          Created: {new Date(note.createdAt).toLocaleString()}
        </p>

        {note.updatedAt !== note.createdAt && (
          <p>
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => editNote(note)}
          className="rounded-lg bg-black/10 px-4 py-2 hover:bg-black/20"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => deleteNote(note.id)}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default Card
