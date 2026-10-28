
function PickingColor({ noteColor, setNoteColor }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-gray-600">
        Choose note color
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setNoteColor('yellow')}
          className={`h-8 w-8 rounded-full bg-yellow-400 ${
            noteColor === 'yellow' ? 'ring-4 ring-gray-400' : ''
          }`}
          aria-label="Yellow"
          title="Yellow"
        />

        <button
          type="button"
          onClick={() => setNoteColor('blue')}
          className={`h-8 w-8 rounded-full bg-blue-400 ${
            noteColor === 'blue' ? 'ring-4 ring-gray-400' : ''
          }`}
          aria-label="Blue"
          title="Blue"
        />

        <button
          type="button"
          onClick={() => setNoteColor('green')}
          className={`h-8 w-8 rounded-full bg-green-400 ${
            noteColor === 'green' ? 'ring-4 ring-gray-400' : ''
          }`}
          aria-label="Green"
          title="Green"
        />

        <button
          type="button"
          onClick={() => setNoteColor('pink')}
          className={`h-8 w-8 rounded-full bg-pink-400 ${
            noteColor === 'pink' ? 'ring-4 ring-gray-400' : ''
          }`}
          aria-label="Pink"
          title="Pink"
        />

        <button
          type="button"
          onClick={() => setNoteColor('purple')}
          className={`h-8 w-8 rounded-full bg-purple-400 ${
            noteColor === 'purple' ? 'ring-4 ring-gray-400' : ''
          }`}
          aria-label="Purple"
          title="Purple"
        />

        <button
          type="button"
          onClick={() => setNoteColor('gray')}
          className={`h-8 w-8 rounded-full bg-gray-300 ${
            noteColor === 'gray' ? 'ring-4 ring-gray-500' : ''
          }`}
          aria-label="Gray"
          title="Gray"
        />
      </div>
    </div>
  )
}

export default PickingColor
