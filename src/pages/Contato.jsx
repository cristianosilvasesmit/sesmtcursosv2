import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTheme } from '../context/ThemeContext'

function Contato() {
    const { themeConfig } = useTheme();
    const contactInfo = themeConfig?.contactInfo || {};
    
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    interest: 'Geral'
                }]);

            if (error) throw error;

            setStatus({ loading: false, success: true, error: null });
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (err) {
            console.error("Erro ao enviar lead:", err);
            setStatus({ loading: false, success: false, error: err.message });
        }
    };

    return (
        <div style={{ paddingTop: '100px' }}>
            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>FALE CONOSCO</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Solicite um orçamento para sua equipe ou tire suas dúvidas sobre nossos cursos.</p>
                    </div>

                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                        <div className="glass-card" style={{ padding: '3rem' }}>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>NOME COMPLETO</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', background: '#0a0a0b', border: '1px solid var(--industrial-border)', padding: '1rem', color: 'white', outline: 'none' }}
                                        placeholder="Ex: João Silva"
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>E-MAIL CORPORATIVO</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', background: '#0a0a0b', border: '1px solid var(--industrial-border)', padding: '1rem', color: 'white', outline: 'none' }}
                                        placeholder="joao@empresa.com.br"
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>MENSAGEM</label>
                                    <textarea
                                        rows="4"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        style={{ width: '100%', background: '#0a0a0b', border: '1px solid var(--industrial-border)', padding: '1rem', color: 'white', outline: 'none', resize: 'none' }}
                                        placeholder="Como podemos ajudar?"
                                    ></textarea>
                                </div>

                                {status.success && (
                                    <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                        ✅ MENSAGEM ENVIADA COM SUCESSO! ENTRAREMOS EM CONTATO EM BREVE.
                                    </div>
                                )}

                                {status.error && (
                                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                        ❌ ERRO AO ENVIAR: {status.error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status.loading}
                                    style={{ width: '100%', background: 'var(--primary-red)', color: 'white', padding: '1.2rem', fontWeight: 900, fontSize: '1rem', transform: 'skewX(-10deg)', boxShadow: '0 0 20px rgba(255,0,0,0.2)', cursor: 'pointer', opacity: status.loading ? 0.7 : 1 }}
                                >
                                    <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>
                                        {status.loading ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                                    </span>
                                </button>
                            </form>
                        </div>

                        <div>
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>ATENDIMENTO DIRETO</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>WhatsApp: {contactInfo.whatsapp || '(11) 9999-9999'}</p>
                                <p style={{ color: 'var(--text-muted)' }}>Email: {contactInfo.email || 'cursos@treinamentos.com.br'}</p>
                            </div>
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>NOSSA UNIDADE</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{contactInfo.addressLine1 || 'Av. Industrial, 1500 - Sala 402'}</p>
                                <p style={{ color: 'var(--text-muted)' }}>{contactInfo.addressLine2 || 'São Paulo - SP'}</p>
                            </div>
                            <div style={{ height: '200px', background: 'var(--bg-card)', border: '1px solid var(--industrial-border)', borderRadius: '8px', backgroundImage: 'var(--hazard-pattern)', opacity: 0.1 }}></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contato
