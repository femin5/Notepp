# Notes App

## Run the app

Install dependencies with `npm install`, then start the JSON Server and Vite in
separate terminals:

```sh
npm run server
npm run dev
```

JSON Server stores notes in `db.json` and exposes the CRUD endpoints at
`http://localhost:5000/notes`. The React app loads notes through Axios and
manages them with `NotesContext`.

The note records include `id`, `title`, `content`, `color`, `tags`, `archived`,
`pinned`, `stock`, `createdAt`, and `updatedAt`.
