import React from 'react'
import { useTheme } from '../context/ThemeContext'

function Footer() {
    const { themeConfig } = useTheme();
    const contactInfo = themeConfig?.contactInfo || {};

    return (
        <footer style={{ background: '#0a0a0b', borderTop: '1px solid var(--industrial-border)', padding: '4rem 0 2rem', position: 'relative' }}>
            <div className="hazard-bg" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundImage: 'var(--hazard-pattern)', opacity: 0.5 }}></div>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    <div>
                        <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '25px', height: '25px', background: 'var(--primary-red)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>+</div>
                            CSE<span style={{ color: 'white' }}>TREINA</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Centro de Segurança e Emergências. Excelência em treinamentos de Qualidade, Segurança e Meio Ambiente (QHSE).
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem' }}>PÁGINAS</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><a href="/">Início</a></li>
                            <li><a href="/cursos">Treinamentos</a></li>
                            <li><a href="/sesmt">Área SESMT</a></li>
                            <li><a href="/contato">Fale Conosco</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem' }}>CONTATO</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li>{contactInfo.email || 'contato@treinamentos.com.br'}</li>
                            <li>{contactInfo.whatsapp || '(11) 9999-9999'}</li>
                            <li>{contactInfo.addressLine2 || 'São Paulo - SP'}</li>
                        </ul>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--industrial-border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    © 2024 CSE - CENTRO DE SEGURANÇA E EMERGÊNCIAS. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    )
}

export default Footer
