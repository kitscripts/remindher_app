import { NavLink, Outlet, Link } from 'react-router-dom'

export default function Layout() {
    const quotes = [
        "Slay queen",
        "Seize the day",
        "You go girl",
        "Conquer the world",
        "Radiate positivity",
        "Believe in yourself",
        "Your potential is endless",
        "Boss moves only",
        "Sparkle everyday",
        "Own your magic"
    ]

    const seed = new Date().toDateString()
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % quotes.length
    const dailyQuote = quotes[index]

    return (
        <div className="layout">
            <nav>
                <div className="brand">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h2 style={{ margin: 0, color: 'var(--primary)' }}>RemindHer</h2>
                    </Link>
                </div>
                <div className="links">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
                    <NavLink to="/add" className={({ isActive }) => isActive ? 'active' : ''}>Add Task</NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''}>Calendar</NavLink>
                    <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink>
                </div>
            </nav>
            <main className="container">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ✨ {dailyQuote} ✨
                </div>
                <Outlet />
            </main>
        </div>
    )
}
