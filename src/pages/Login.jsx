import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Obter token do hCaptcha com segurança
        let captchaToken = '';
        try {
            if (window.hcaptcha) {
                captchaToken = window.hcaptcha.getResponse();
            } else {
                setError('O sistema de segurança (Captcha) está carregando. Aguarde um instante.');
                return;
            }
        } catch (err) {
            setError('Erro no sistema de segurança. Por favor, recarregue a página.');
            return;
        }

        if (!captchaToken) {
            setError('Por favor, complete a verificação de segurança (Captcha).');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await login(email, password, captchaToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login. Verifique seus dados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '80px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                {/* Detalhe estético industrial */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary-red)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', backgroundImage: 'var(--hazard-pattern)', opacity: 0.2 }}></div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '4px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        background: 'rgba(255, 68, 68, 0.1)',
                        color: '#ff4444',
                        border: '1px solid #ff4444',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-mail ou CPF</label>
                        <input
                            required
                            type="text"
                            placeholder="Digite seu acesso"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Senha</label>
                            <Link to="/forgot-password" style={{ color: 'var(--accent-yellow)', fontSize: '0.75rem', fontWeight: 700 }}>ESQUECEU A SENHA?</Link>
                        </div>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            fontWeight: 900,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isLoading ? 'AUTENTICANDO...' : 'ENTRAR NO PORTAL'}
                    </button>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Ainda não tem conta? <Link to="/signup" style={{ color: 'white', fontWeight: 700 }}>Cadastre-se aqui</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
