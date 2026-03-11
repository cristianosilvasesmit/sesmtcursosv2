import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cpf: '',
        confirmPassword: ''
    });

    const [isSigningUp, setIsSigningUp] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setIsSigningUp(true);
        setError('');

        try {
            await signup(formData);
            alert("Conta criada com sucesso! Verifique seu e-mail se necessário.");
            navigate('/dashboard');
        } catch (err) {
            console.error("Erro no cadastro:", err.message);
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setIsSigningUp(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-yellow)' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', letterSpacing: '1px', color: 'var(--accent-yellow)' }}>CRIAR CONTA</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Entre para a elite da segurança industrial</p>
                </div>

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
                    {/* ... campos existentes ... */}
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nome Completo</label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: João Silva"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>CPF</label>
                            <input
                                required
                                type="text"
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-mail</label>
                            <input
                                required
                                type="email"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Crie uma Senha</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Confirme sua Senha</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSigningUp}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            fontWeight: 900,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: isSigningUp ? 'not-allowed' : 'pointer',
                            opacity: isSigningUp ? 0.7 : 1,
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isSigningUp ? 'GERANDO ACESSO...' : 'FINALIZAR CADASTRO'}
                    </button>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Já possui uma conta? <Link to="/login" style={{ color: 'white', fontWeight: 700 }}>Entrar agora</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
