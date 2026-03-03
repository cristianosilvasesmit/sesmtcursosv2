import React from 'react'
import direcaoImg from '../assets/images/direcao.png'
import nr35Img from '../assets/images/nr35.png'
import heroImg from '../assets/images/hero.png'
import nr10Img from '../assets/images/nr10.png'
import nr33Img from '../assets/images/nr33.png'

function Cursos() {
    const cursos = [
        { title: 'NR10 - ELÉTRICA', hours: '40H', color: 'var(--accent-yellow)', img: nr10Img },
        { title: 'NR33 - ESPAÇO CONFINADO', hours: '16H', color: 'var(--primary-red)', img: nr33Img },
        { title: 'NR35 - TRABALHO EM ALTURA', hours: '08H', color: 'var(--primary-red)', img: nr35Img },
        { title: 'DIREÇÃO DEFENSIVA', hours: '08H', color: 'var(--accent-yellow)', img: direcaoImg },
        { title: 'BOMBEIRO CIVIL', hours: '210H', color: 'var(--primary-red)', img: heroImg },
        { title: 'PRIMEIROS SOCORROS', hours: '04H', color: 'var(--accent-yellow)', img: direcaoImg },
    ]

    return (
        <div style={{ paddingTop: '100px' }}>
            <section className="section-padding reveal">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>TREINAMENTOS</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                            Catálogo completo de normas regulamentadoras e formações profissionais reconhecidas nacionalmente.
                        </p>
                    </div>

                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
                        {cursos.map((item, i) => (
                            <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ height: '200px', background: `linear-gradient(transparent, rgba(10,10,11,0.9)), url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.8)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, border: `1px solid ${item.color}` }}>
                                        {item.hours}
                                    </div>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>{item.title}</h3>
                                    <a href={`https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre o treinamento de ${item.title}.`} target="_blank" rel="noopener noreferrer" style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--industrial-border)', color: 'white', fontWeight: 900, borderRadius: '4px', fontSize: '0.7rem', display: 'block', textAlign: 'center', transition: 'all 0.3s' }}>
                                        SOLICITAR INFORMAÇÕES
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Cursos
