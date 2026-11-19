# AppointFlow Frontend

The frontend is a React 19 single-page application built with Vite. It includes the client booking flow, provider portal, and admin workspace.

For full-stack prerequisites, database configuration, admin setup, and start-up instructions, see the [project README](../README.md).

## Frontend commands

Run these from the repository root:

```bash
npm install
npm run dev
npm run lint
npm run build
```

The development server uses `http://localhost:3000`. Requests to `/api` are proxied to `http://localhost:8081` by default. Set `BACKEND_URL` to point to a different backend address.
