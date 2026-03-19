import React from 'react'
import { Link } from 'react-router-dom'
import sesmtHero from '../assets/images/sesmt_hero.png'

function Sesmt() {
    const servicos = [
        { title: 'ELABORAÇÃO DE PGR/PCMAT', desc: 'Programa de Gerenciamento de Riscos conforme as novas normas.' },
        { title: 'LAUDOS TÉCNICOS (LTCAT)', desc: 'Avaliação detalhada de agentes nocivos para fins previdenciários.' },
        { title: 'TREINAMENTOS DE NR', desc: 'Capacitação completa para todas as normas regulamentadoras.' },
        { title: 'GESTÃO DE CIPA', desc: 'Assessoria completa para implantação e manutenção da comissão.' },
    ]

    return (
        <div style={{ paddingTop: '100px' }}>
            <section className="section-padding reveal">
                <div className="container">
                    <div className="sesmt-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                        <div>
                            <div className="alert-strip" style={{ marginBottom: '1.5rem' }}><span>SOLUÇÕES SESMT</span></div>
                            <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>GESTÃO E INTELIGÊNCIA EM SEGURANÇA</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Nossa consultoria SESMT vai além do papel. Implementizamos uma cultura de segurança real, reduzindo acidentes e garantindo o compliance total da sua empresa com a legislação vigente.
                            </p>
                            <Link to="/contato" style={{ display: 'inline-block', padding: '1.2rem 2.5rem', background: 'var(--primary-red)', color: 'white', fontWeight: 900, textDecoration: 'none', borderRadius: '4px', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255,0,0,0.3)', transition: 'transform 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                FALE COM UM ESPECIALISTA
                            </Link>
                        </div>
                        <div className="sesmt-image" style={{ height: '500px', background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${sesmtHero})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--industrial-border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        </div>
                    </div>

                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {servicos.map((s, i) => (
                            <Link to="/contato" key={i} className="glass-card" style={{ padding: '2.5rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', cursor: 'pointer' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--primary-red)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                                <div style={{ color: 'var(--primary-red)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>0{i + 1}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flex: 1 }}>{s.desc}</p>
                                <div style={{ color: 'var(--primary-red)', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    SOLICITAR ORÇAMENTO <span>→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Sesmt
