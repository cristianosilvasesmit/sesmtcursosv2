import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <header className="header" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--industrial-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10, 10, 11, 0.95)', backdropFilter: 'blur(10px)', position: 'fixed', width: '100%', top: 0, zIndex: 100 }}>
            <Link to="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', background: 'var(--primary-red)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>+</div>
                CSE<span style={{ color: 'white' }}>TREINA</span>
            </Link>

            {/* Menu Desktop */}
            <nav className="nav-desktop" style={{ display: 'flex', gap: '2rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Link to="/" style={{ color: isActive('/') ? 'white' : 'var(--text-muted)' }}>INÍCIO</Link>
                <Link to="/cursos" style={{ color: isActive('/cursos') ? 'white' : 'var(--text-muted)' }}>TREINAMENTOS</Link>
                <Link to="/sesmt" style={{ color: isActive('/sesmt') ? 'white' : 'var(--text-muted)' }}>SESMT</Link>
                <Link to="/contato" style={{ color: isActive('/contato') ? 'white' : 'var(--text-muted)' }}>CONTATO</Link>
            </nav>

            <div className="auth" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="nav-desktop" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/dashboard" style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>OLÁ, {user.name.toUpperCase()}</Link>
                            <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--primary-red)', fontWeight: 700, fontSize: '0.85rem' }}>SAIR</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ background: 'transparent', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>LOGIN</Link>
                            <Link to="/signup" style={{ background: '#22c55e', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.85rem' }}>CADASTRE-SE</Link>
                        </>
                    )}
                </div>

                {/* Botão Mobile Hamburger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ background: 'transparent', color: 'white', fontSize: '1.8rem', cursor: 'pointer' }}
                    className="mobile-toggle"
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Menu Mobile Overlay */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: 'var(--bg-dark)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 99, borderTop: '1px solid var(--industrial-border)' }}>
                    <Link onClick={() => setIsMenuOpen(false)} to="/" style={{ color: isActive('/') ? 'var(--primary-red)' : 'white', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>INÍCIO</Link>
                    <Link onClick={() => setIsMenuOpen(false)} to="/cursos" style={{ color: isActive('/cursos') ? 'var(--primary-red)' : 'white', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>TREINAMENTOS</Link>
                    <Link onClick={() => setIsMenuOpen(false)} to="/sesmt" style={{ color: isActive('/sesmt') ? 'var(--primary-red)' : 'white', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>SESMT</Link>
                    <Link onClick={() => setIsMenuOpen(false)} to="/contato" style={{ color: isActive('/contato') ? 'var(--primary-red)' : 'white', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>CONTATO</Link>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--industrial-border)', paddingTop: '2rem' }}>
                        {user ? (
                            <>
                                <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '1.2rem', borderRadius: '4px', textAlign: 'center', fontWeight: 900 }}>DASHBOARD (OLÁ, {user.name.split(' ')[0]})</Link>
                                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} style={{ background: 'var(--primary-red)', color: 'white', padding: '1.2rem', borderRadius: '4px', fontWeight: 900 }}>SAIR DA CONTA</button>
                            </>
                        ) : (
                            <>
                                <Link onClick={() => setIsMenuOpen(false)} to="/login" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '1.2rem', borderRadius: '4px', textAlign: 'center', fontWeight: 900 }}>LOGIN / ENTRAR</Link>
                                <Link onClick={() => setIsMenuOpen(false)} to="/signup" style={{ background: '#22c55e', color: 'white', padding: '1.2rem', borderRadius: '4px', textAlign: 'center', fontWeight: 900 }}>CADASTRE-SE AGORA</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
