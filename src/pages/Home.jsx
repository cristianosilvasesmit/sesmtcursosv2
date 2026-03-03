import React from 'react'
import heroImg from '../assets/images/hero.png'
import direcaoImg from '../assets/images/direcao.png'
import nr35Img from '../assets/images/nr35.png'

function Home() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero reveal" style={{ height: '95vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', background: `linear-gradient(rgba(10, 10, 11, 0.8), rgba(10, 10, 11, 0.8)), url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="hazard-bg" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'var(--hazard-pattern)', opacity: 0.15 }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--accent-yellow)', fontWeight: 900, letterSpacing: '4px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', border: '1px solid var(--accent-yellow)' }}>TREINAMENTOS ONLINE E PRESENCIAIS</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 0.85, marginBottom: '2.5rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                        <span style={{ display: 'block', opacity: 0.9 }}>CSE</span>
                        <div className="alert-strip" style={{ fontSize: '0.35em', marginTop: '10px' }}>
                            <span>CENTRO DE SEGURANÇA E EMERGÊNCIAS</span>
                        </div>
                    </h1>

                    <p style={{ maxWidth: '700px', margin: '0 auto 3rem', color: 'white', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.4, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        Domine as NRs com a maior autoridade em <span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>Segurança do Trabalho</span> e <span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>Resgate Industrial</span>.
                    </p>

                    <div className="flex-buttons" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/cursos" style={{ background: 'var(--primary-red)', color: 'white', padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', boxShadow: '0 0 30px rgba(255,0,0,0.4)', transform: 'skewX(-10deg)', transition: 'all 0.3s', display: 'inline-block' }}>
                            <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>CONHECER CURSOS</span>
                        </Link>
                        <a href="https://wa.me/5511999999999?text=Olá! Gostaria de falar com um consultor da CSE." target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', transform: 'skewX(-10deg)', display: 'inline-block' }}>
                            <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>FALAR CONSULTOR</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Treinamentos Preview */}
            <section className="section-padding reveal" style={{ position: 'relative', animationDelay: '0.2s' }}>
                <div className="hazard-bg" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', backgroundImage: 'var(--hazard-pattern)', opacity: 0.05 }}></div>

                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ color: 'var(--primary-red)', fontWeight: 900, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>CATÁLOGO 2024</div>
                            <h2 style={{ fontSize: '3rem' }}>CURSOS DE ELITE</h2>
                        </div>
                        <a href="#" style={{ color: 'var(--accent-yellow)', fontWeight: 700, fontSize: '0.9rem', borderBottom: '2px solid var(--accent-yellow)', paddingBottom: '4px' }}>VER TODOS OS CURSOS</a>
                    </div>

                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
                        {[
                            { title: 'DIREÇÃO DEFENSIVA', hours: '08H', color: 'var(--accent-yellow)', img: direcaoImg },
                            { title: 'NR35 TRABALHO EM ALTURA', hours: '16H', color: 'var(--primary-red)', img: nr35Img },
                            { title: 'BOMBEIRO CIVIL', hours: '210H', color: 'var(--primary-red)', img: heroImg },
                        ].map((item, i) => (
                            <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ height: '240px', background: `linear-gradient(transparent, rgba(10,10,11,0.9)), url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.8)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, border: `1px solid ${item.color}` }}>
                                        {item.hours}
                                    </div>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'white' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Treinamento rigoroso seguindo todas as normas nacionais e internacionais de segurança.</p>
                                    <a href={`https://wa.me/5511999999999?text=Olá! Tenho interesse no curso de ${item.title}.`} target="_blank" rel="noopener noreferrer" style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--industrial-border)', color: 'white', fontWeight: 900, borderRadius: '4px', transition: 'all 0.3s', fontSize: '0.8rem', letterSpacing: '1px', display: 'block', textAlign: 'center' }}>
                                        MATRICULE-SE AGORA
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Home
