import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div style={{ padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Accueil</Link>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
