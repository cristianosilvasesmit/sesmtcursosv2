import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { sendPasswordReset } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Obter token do hCaptcha com segurança
        let captchaToken = '';
        try {
            if (window.hcaptcha) {
                captchaToken = window.hcaptcha.getResponse();
            } else {
                setMessage({ type: 'error', text: 'O sistema de segurança (Captcha) ainda está carregando. Aguarde um instante.' });
                return;
            }
        } catch (err) {
            console.error("Erro ao obter captcha:", err);
            setMessage({ type: 'error', text: 'Erro no sistema de segurança. Recarregue a página.' });
            return;
        }

        if (!captchaToken) {
            setMessage({ type: 'error', text: 'Por favor, complete a verificação de segurança (Captcha) antes de continuar.' });
            return;
        }

        setIsSending(true);
        setMessage({ type: '', text: '' });

        try {
            await sendPasswordReset(email, captchaToken);
            setMessage({ type: 'success', text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' });
        } catch (err) {
            console.error(err);
            const errorMsg = err.message.includes("after")
                ? `Segurança: Aguarde ${err.message.match(/\d+/)} segundos para tentar novamente.`
                : "Erro ao enviar e-mail. Verifique os dados ou tente mais tarde.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '80px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-yellow)' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', letterSpacing: '1px', color: 'var(--accent-yellow)' }}>RECUPERAR ACESSO</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Enviaremos um link de redefinição para seu e-mail</p>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '4px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                        color: message.type === 'success' ? '#22c55e' : '#ff4444',
                        border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ff4444'}`,
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Seu E-mail Cadastrado</label>
                        <input
                            required
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <div
                            className="h-captcha"
                            data-sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                            data-theme="dark"
                        ></div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSending}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            fontWeight: 900,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: isSending ? 'not-allowed' : 'pointer',
                            opacity: isSending ? 0.7 : 1,
                            boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isSending ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                        <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Voltar para o Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
