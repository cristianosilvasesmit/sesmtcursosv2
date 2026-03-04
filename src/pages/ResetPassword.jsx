import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar se temos uma sessão de recuperação ativa
        console.log("Verificando sessão de recuperação...");

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Sessão atual no Reset:", session ? "Ativa" : "Nula");

            // O evento onAuthStateChange também ajuda aqui
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log("Evento detectado no ResetPassword:", event);
                if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery'))) {
                    setIsReady(true);
                }
            });

            // Se já tiver uma sessão e for do tipo recovery ou houver hash de recovery
            if (session || window.location.hash.includes('type=recovery')) {
                setIsReady(true);
            }

            return () => subscription.unsubscribe();
        };

        checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isReady) {
            setMessage({ type: 'error', text: 'Sessão de recuperação não iniciada. Tente clicar no link do e-mail novamente.' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await updatePassword(password);
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Você será redirecionado para o login...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erro ao atualizar senha. O link pode ter expirado.' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '80px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary-red)' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', letterSpacing: '1px', color: 'white' }}>NOVA <span style={{ color: 'var(--primary-red)' }}>SENHA</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Escolha uma senha forte para seu acesso</p>
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nova Senha</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Confirmar Senha</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            fontWeight: 900,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.7 : 1,
                            boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isUpdating ? 'ATUALIZANDO...' : 'REDEFINIR SENHA AGORA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
