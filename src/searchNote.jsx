
function SearchNote({
  search,
  setSearch,
  filterColor,
  setFilterColor,
  filterTag,
  setFilterTag,
  sortBy,
  setSortBy,
  allTags
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

      {/* Search notes */}
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Filter by color */}
      <select
        value={filterColor}
        onChange={(e) => setFilterColor(e.target.value)}
        className="rounded-lg bg-gray-800 p-3 text-white"
      >
        <option value="all">All colors</option>
        <option value="yellow">Yellow</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="pink">Pink</option>
        <option value="purple">Purple</option>
        <option value="gray">Gray</option>
      </select>

      {/* Filter by tag */}
      <select
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        className="rounded-lg bg-gray-800 p-3 text-white"
      >
        <option value="all">All tags</option>

        {allTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      {/* Sort notes */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="rounded-lg bg-gray-800 p-3 text-white"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title">Sort by title</option>
        <option value="color">Sort by color</option>
      </select>

    </div>
  )
}

export default SearchNote
