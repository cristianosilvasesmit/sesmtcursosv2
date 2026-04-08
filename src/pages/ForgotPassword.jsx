import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // 'email' ou 'code'
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { sendPasswordReset, verifyResetCode } = useAuth();
    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();

        setIsSending(true);
        setMessage({ type: '', text: '' });

        try {
            await sendPasswordReset(email);
            setMessage({ type: 'success', text: 'E-mail enviado! Agora digite o código de 8 dígitos que você recebeu.' });
            setStep('code');
        } catch (err) {
            console.error(err);
            const errorMsg = err.message.includes("after")
                ? `Aguarde ${err.message.match(/\d+/)} segundos para tentar novamente.`
                : "Erro ao enviar e-mail. Verifique o endereço digitado.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setMessage({ type: '', text: '' });

        try {
            await verifyResetCode(email, token);
            // Se chegou aqui, o código é válido e o usuário está autenticado
            navigate('/reset-password');
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Código inválido ou expirado. Tente novamente.' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-yellow)' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', letterSpacing: '1px', color: 'var(--accent-yellow)' }}>
                        {step === 'email' ? 'RECUPERAR ACESSO' : 'DIGITE O CÓDIGO'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {step === 'email'
                            ? 'Enviaremos um código de segurança para seu e-mail'
                            : `Enviamos um código de 8 dígitos para ${email}`}
                    </p>
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

                {step === 'email' ? (
                    <form onSubmit={handleSendEmail}>
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

                        <button
                            type="submit"
                            disabled={isSending}
                            style={{ width: '100%', padding: '1.2rem', background: 'var(--primary-red)', color: 'white', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, boxShadow: '0 4px 20px rgba(255,0,0,0.3)', marginBottom: '1.5rem' }}
                        >
                            {isSending ? 'ENVIANDO...' : 'SOLICITAR CÓDIGO'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode}>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Código de 8 Dígitos</label>
                            <input
                                required
                                type="text"
                                maxLength="8"
                                placeholder="00000000"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.1)', border: '2px solid var(--accent-yellow)', borderRadius: '4px', color: 'white', outline: 'none', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3rem', fontWeight: 900 }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            style={{ width: '100%', padding: '1.2rem', background: 'var(--accent-yellow)', color: 'black', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, boxShadow: '0 4px 20px rgba(255,193,7,0.3)', marginBottom: '1.5rem' }}
                        >
                            {isSending ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Não recebeu? Tentar novamente
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Voltar para o Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
